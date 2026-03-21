import type { Request, Response, NextFunction } from 'express';

import {
    AccessDto,
    UserRoleUpdateDto,
    RoleToUserObjIdsMap,
    AccessUserPathParamsDto
} from '#/dto/access';
import { ApiError } from '#/exceptions/api';
import { getJwtBody } from '#/utils/api';
import { Project, User } from '#/db/models';
import { ProjectPathParamsDto } from '#/dto/project';
import type { ApiResponseSuccess } from '#/dto/api';
import type { AccessDtoType, RoleToUserObjIdsMapType } from '#/dto/access';
import type { IUser, IProject, IProjectUserAndInvitePopulated } from '#/db/interfaces';


export async function getAccesses(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = ProjectPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    // Project retrieval (role to user mapping + role to scope mapping + invites)
    const project = await Project.findOne({ _id: params.data.projectObjId })
        .populate('users')
        .populate<IProjectUserAndInvitePopulated>('invites');
    if (!project)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { projectObjId: params.data.projectObjId }
        }));

    // Response
    const response: ApiResponseSuccess<AccessDtoType> = {
        success: true,
        data: AccessDto.parse(project)
    };
    return res.status(200).json(response);
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = AccessUserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const userRoleUpdateParse = UserRoleUpdateDto.safeParse(req.body);
    if (!userRoleUpdateParse.success)
        return next(new ApiError({
            message: 'Malformed project user role update fields',
            statusCode: 422,
            details: userRoleUpdateParse.error.issues
        }));

    // Project retrieval + checks
    const project: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!project)
        return next(new ApiError({
            details: { params: params.data }
        }));
    if (!project.userObjIds.includes(params.data.userObjId))
        return next(new ApiError({
            message: 'Modified user with provided ID is not part of the specified project',
            statusCode: 422,
            details: { params: params.data }
        }));
    if (project.roleToUserObjIdsMap.get(userRoleUpdateParse.data.newRole) === undefined)
        return next(new ApiError({
            message: 'Role does not exist in the specified project',
            statusCode: 422,
            details: { params: params.data }
        }));
    const userRole = project.roleToUserObjIdsMap
        .entries()
        .find(([_, userObjIds]) => userObjIds.includes(params.data.userObjId))
        ?.[0];
    if (!userRole)
        return next(new ApiError({
            details: { params: params.data }
        }));
    if (userRole == userRoleUpdateParse.data.newRole)
        return next(new ApiError({
            message: 'Modified user already has specified role',
            statusCode: 422,
            details: { params: params.data }
        }));
    // User role update
    const updatedRoleToUserObjIds = new Map(
        project.roleToUserObjIdsMap
            .entries()
            .map(([role, userObjIds]) => [
                role,
                userObjIds.filter((userObjId) => !userObjId.equals(params.data.userObjId))
            ])
    );
    updatedRoleToUserObjIds
        .get(userRoleUpdateParse.data.newRole)
        ?.push(params.data.userObjId);
    project.roleToUserObjIdsMap = updatedRoleToUserObjIds;
    await project.save();

    // Response
    const response: ApiResponseSuccess<RoleToUserObjIdsMapType> = {
        success: true,
        data: RoleToUserObjIdsMap.parse(project.roleToUserObjIdsMap)
    };
    res.status(200).json(response);
}

export async function removeUser(req: Request, res: Response, next: NextFunction) {
    // Validation
    const params = AccessUserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    const jwtBodyParse = getJwtBody(res);
    if (!jwtBodyParse.success)
        return next(new ApiError({
            details: { jwtBodyParse: jwtBodyParse }
        }));
    if (params.data.userObjId.equals(jwtBodyParse.data.userObjId))
        return next(new ApiError({
            message: 'Owner cannot remove themselves from the project, use disband endpoint instead',
            statusCode: 422,
            details: { params: params.data }
        }));

    // Project retrieval
    const project: IProject | null = await Project.findOne({ _id: params.data.projectObjId });
    if (!project)
        return next(new ApiError({
            message: 'Project with provided ID does not exist',
            statusCode: 422,
            details: { params: params.data }
        }));
    // Remove user reference from project
    const filteredRoleToUserObjIds = new Map(
        project.roleToUserObjIdsMap
            .entries()
            .map(([role, userObjIds]) => [role, userObjIds.filter((userObjId) => !userObjId.equals(params.data.userObjId))])
    );
    project.roleToUserObjIdsMap = filteredRoleToUserObjIds;
    const filteredUserObjIds = project.userObjIds
        .filter((userObjId) => !userObjId.equals(params.data.userObjId));
    project.userObjIds = filteredUserObjIds;
    await project.save();
    // Remove project reference from user
    const user: IUser | null = await User.findOne({ _id: params.data.userObjId });
    if (!user)
        return next(new ApiError({
            details: { _id: params.data.userObjId }
        }));
    user.projectObjIds = user.projectObjIds
        .filter((projectObjId) => !projectObjId.equals(project._id));
    await user.save();

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    res.status(200).json(response);
}
