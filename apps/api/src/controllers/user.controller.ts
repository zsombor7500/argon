import crypto from 'crypto';

import type { Request, Response, NextFunction } from 'express';

import {
    UserUpdateDto,
    UserProfileDto,
    UserPathParamsDto,
    UserRegistrationDto
} from '#/dto/user';
import { User } from '#/db/models';
import { hashText } from '#/utils/api';
import { ApiError } from '#/exceptions/api';
import { isDuplicateKeyError } from '#/utils/db';
import type { IUser } from '#/db/interfaces';
import type { UserProfile } from '#/dto/user';
import type { ApiResponseSuccess } from '#/dto/api';


export async function createUser(req: Request, res: Response, next: NextFunction) {
    const userCredentialsParse = UserRegistrationDto.safeParse(req.body);
    if (!userCredentialsParse.success)
        return next(new ApiError({
            message: 'Malformed user registration credentials',
            statusCode: 422,
            details: userCredentialsParse.error.issues
        }));

    const userId = crypto.randomUUID();
    const passwordHash = await hashText(userCredentialsParse.data.password);
    let newUser: IUser;
    try {
        newUser = await User.create({
            userId: userId,
            userGrn: `user:${userId}`,
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

    const response: ApiResponseSuccess<UserProfile> = {
        success: true,
        data: UserProfileDto.parse(newUser)
    };
    return res.status(200).json(response);
}

export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
    const params = UserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    const user: IUser | null = await User.findOne({
        userId: params.data.userId
    });
    if (!user)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { userId: params.data.userId }
        }));

    const response: ApiResponseSuccess<UserProfile> = {
        success: true,
        data: UserProfileDto.parse(user)
    };
    return res.status(200).json(response);
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    const params = UserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
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
            message: 'Missing user update fields',
            statusCode: 400,
            details: {}
        }));

    const updatedUser: IUser | null = await User.findOneAndUpdate(
        { userId: params.data.userId },
        { $set: userUpdateParse.data },
        { returnDocument: 'after', runValidators: true }
    );
    if (!updatedUser)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { userId: params.data.userId }
        }));

    const response: ApiResponseSuccess<UserProfile> = {
        success: true,
        data: UserProfileDto.parse(updatedUser)
    };
    res.status(200).json(response);
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    const params = UserPathParamsDto.safeParse(req.params);
    if (!params.success)
        return next(new ApiError({
            message: 'Malformed path parameters',
            statusCode: 422,
            details: params.error.issues
        }));

    const deletedUser: IUser | null = await User.findOneAndDelete(
        { userId: params.data.userId }
    );
    if (!deletedUser)
        return next(new ApiError({
            message: 'User with provided ID does not exist',
            statusCode: 422,
            details: { userId: params.data.userId }
        }));

    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    res.status(200).json(response);
}
