import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import type { Request, Response, NextFunction } from 'express';

import { Project } from '#/db/models';
import { ApiError } from '#/exceptions/api';
import { apiConfig } from '#/configs/api';
import { JwtTokenBodyDto} from '#/dto/auth';
import { RES_LOCALS_JWT_KEY } from '#/constants/api';
import { ProjectPathParamsDto } from '#/dto/project';
import type { ProjectScopeDtoType } from '#/dto/scope';
import type { IUser, IProjectUserPopulated } from '#/db/interfaces';


export function authJwt(req: Request, res: Response, next: NextFunction) {
    // Validation
    if (!req.headers.authorization)
        return next(new ApiError({
            message: 'Missing Authorization HTTP header',
            statusCode: 401,
            details: {}
        }));

    // Token validation
    const token = req.headers.authorization.split('Bearer: ')[1];
    if (!token)
        return next(new ApiError({
            message: 'Malformed Authorization HTTP header',
            statusCode: 401,
            details: {}
        }));
    try {
        const jwtBody = jwt.verify(token, apiConfig.jwtSecretKey)
        const jwtBodyParse = JwtTokenBodyDto.safeParse(jwtBody);
        if (!jwtBodyParse.success)
            return next(new ApiError({
                message: 'Malformed JWT token',
                statusCode: 401,
                details: jwtBody
            }))
        res.locals[RES_LOCALS_JWT_KEY] = jwtBodyParse.data;
    } catch (err) {
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: err
        }))
    }

    return next();
}

export function requireScope(allowScopes: Set<ProjectScopeDtoType>) {
    return async function scopeAuthorizationMiddleware(req: Request, res: Response, next: NextFunction) {
        // Validation
        const jwtBody = JwtTokenBodyDto.safeParse(res.locals[RES_LOCALS_JWT_KEY])
        if (!jwtBody.success)
            return next(new ApiError({
                details: { message: 'JWT data was missing during Authorization scope check'}
            }));
        const params = ProjectPathParamsDto.safeParse(req.params);
        if (!params.success)
            return next(new ApiError({
                message: 'Malformed path parameters',
                statusCode: 422,
                details: params.error.issues
            }));

        // Retrieve project
        const project = await Project.findOne({ _id: params.data.projectObjId })
            .populate<IProjectUserPopulated>('userObjIds')
        if (!project)
            return next(new ApiError({
                message: 'Project with provided ID does not exist',
                statusCode: 422,
                details: { _id: params.data.projectObjId }
            }));
        // Check scope
        const user: IUser | undefined = project.users.find((user) => user._id === new Types.ObjectId(jwtBody.data.userObjId));
        if (!user) // TODO: Set instead of array
            return next(new ApiError({
                message: 'User is not a member of the project',
                statusCode: 422,
                details: {
                    userObjId: jwtBody.data.userObjId,
                    projectObjId: params.data.projectObjId
                }
            }));
        let userRole: string | undefined = undefined;
        for (const [role, userObjIds] of project.roleToUserObjIdsMap) {
            if (userObjIds.includes(user._id)) {
                userRole = role;
                break;
            }
        }
        if (!userRole)
            return next(new ApiError({
                details: {
                    message: 'User role is missing in project',
                    userObjId: params.data.projectObjId,
                    projectObjId: params.data.projectObjId
                }
            }));
        const userScopes: string[] | undefined = project.roleToScopesMap.get(userRole); // TODO: Fix type mistaken by TS
        if (!userScopes)
            return next(new ApiError({
                details: {
                    message: 'Project role scope not found in project roles map',
                    userObjId: params.data.projectObjId,
                    projectObjId: params.data.projectObjId
                }
            }));
        const passingScopes = allowScopes.intersection(new Set(userScopes))
        if (passingScopes.size === 0)
            return next(new ApiError({
                message: 'Missing scope permissions',
                statusCode: 403
            }));

        return next();
    }
}
