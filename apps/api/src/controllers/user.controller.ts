import type { Request, Response, NextFunction } from 'express';

import {
    UserUpdateDto,
    UserProfileDto,
    UserPathParamsDto,
    UserRegistrationDto
} from '#/dto/user';
import {
    deleteInvites,
    deleteProject,
    isDuplicateKeyError,
    removeUserFromProject
} from '#/utils/db';
import { ApiError } from '#/exceptions/api';
import { getJwtBody } from '#/utils/api';
import { Project, User } from '#/db/models';
import { getBcryptHash } from '#/utils/api';
import type { IUser } from '#/db/interfaces';
import type { ApiResponseSuccess } from '#/dto/api';
import type { UserProfileDtoType } from '#/dto/user';


export async function createUser(req: Request, res: Response, next: NextFunction) {
    // Validation
    const userCredentialsParse = UserRegistrationDto.safeParse(req.body);
    if (!userCredentialsParse.success)
        return next(new ApiError({
            message: 'Malformed user registration credentials',
            statusCode: 422,
            details: userCredentialsParse.error.issues
        }));

    // User creation
    const passwordHash = await getBcryptHash(userCredentialsParse.data.password);
    let newUser: IUser;
    try {
        newUser = await User.create({
            username: userCredentialsParse.data.username,
            displayName: userCredentialsParse.data.username,
            email: userCredentialsParse.data.email,
            passwordHash: passwordHash
        });
    } catch (err) {
        if (isDuplicateKeyError(err))
            return next(new ApiError({
                message: 'User already exists with provided email',
                statusCode: 422,
                details: err
            }));
        return next(err);
    }

    // Response
    const response: ApiResponseSuccess<UserProfileDtoType> = {
        success: true,
        data: UserProfileDto.parse(newUser)
    };
    return res.status(200).json(response);
}

export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
    // Validation
    const jwtBody = getJwtBody(res);
    const params = UserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    if (!params.data.userObjId.equals(jwtBody.userObjId))
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403
        }));

    // User retrieval
    const user: IUser | null = await User.findOne({ _id: params.data.userObjId });
    if (!user)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { _id: params.data.userObjId }
        }));

    // Response
    const response: ApiResponseSuccess<UserProfileDtoType> = {
        success: true,
        data: UserProfileDto.parse(user)
    };
    return res.status(200).json(response);
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    // Validation
    const jwtBody = getJwtBody(res);
    const params = UserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    if (!params.data.userObjId.equals(jwtBody.userObjId))
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403
        }));
    const userUpdateParse = UserUpdateDto.safeParse(req.body);
    if (!userUpdateParse.success)
        return next(new ApiError({
            message: 'Malformed user update fields',
            statusCode: 422,
            details: userUpdateParse.error.issues
        }));
    if (Object.keys(userUpdateParse.data).length === 0)
        return next(new ApiError({
            message: 'No update was performed as no update fields were specified',
            statusCode: 400
        }));

    // User update
    let updatedUser: IUser | null;
    try {
        updatedUser = await User.findOneAndUpdate(
            { _id: jwtBody.userObjId },
            { $set: userUpdateParse.data },
            { returnDocument: 'after', runValidators: true }
        );
    } catch (err) {
        if (isDuplicateKeyError(err))
            return next(new ApiError({
                message: 'User already exists with provided email',
                statusCode: 422,
                details: err
            }));
        return next(err);
    }
    if (!updatedUser)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { userObjId: params.data.userObjId }
        }));

    // Response
    const response: ApiResponseSuccess<UserProfileDtoType> = {
        success: true,
        data: UserProfileDto.parse(updatedUser)
    };
    res.status(200).json(response);
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    // Validation
    const jwtBody = getJwtBody(res);
    const params = UserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));
    if (!params.data.userObjId.equals(jwtBody.userObjId))
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403
        }));

    // User deletion
    const deletedUser: IUser | null = await User.findOneAndDelete({ _id: params.data.userObjId });
    if (!deletedUser)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { userObjId: params.data.userObjId }
        }));
    // Invite + removal from project members
    if (deletedUser.inviteObjIds.length !== 0)
        await deleteInvites(deletedUser.inviteObjIds);
    const projects = await Project.find({ _id: { $in: deletedUser.projectObjIds} });
    for (const project of projects) {
        if (project.ownerObjId.equals(deletedUser._id)) {
            await deleteProject(project._id);
            continue;
        }
        await removeUserFromProject(deletedUser._id, project);
    };

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    res.status(200).json(response);
}
