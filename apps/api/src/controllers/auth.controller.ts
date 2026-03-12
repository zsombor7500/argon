import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

import { User } from '#/db/models';
import { ApiError } from '#/exceptions/api';
import { apiConfig } from '#/configs/api';
import { verifyText } from '#/utils/api';
import { JwtTokenDto, UserLoginDto } from '#/dto/auth';
import type { IUser } from '#/db/interfaces';
import type { ApiResponseSuccess } from '#/dto/api';
import type { JwtTokenBodyDtoType, JwtTokenDtoType } from '#/dto/auth';


export async function login(req: Request, res: Response, next: NextFunction) {
    // Validation
    const userLogin = UserLoginDto.safeParse(req.body);
    if (!userLogin.success)
        return next(new ApiError({
            message: 'Malformed user login credentials',
            statusCode: 422,
            details: userLogin.error.issues
        }));

    // User retrieval
    const user: IUser | null = await User.findOne({
        email: userLogin.data.email
    });
    if (!user)
        return next(new ApiError({
            message: 'User with provided email does not exist',
            statusCode: 422,
            details: { email: userLogin.data.email }
        }));

    // Password validation
    if (!await verifyText(userLogin.data.password, user.passwordHash))
        return next(new ApiError({
            message: 'User with provided email does not exist',
            statusCode: 422,
            details: { email: userLogin.data.email }
        }));

    // Response
    const jwtBody: JwtTokenBodyDtoType = {
        iat: Date.now(),
        expiration: apiConfig.jwtExpiry,
        userObjId: user._id
    }
    const response: ApiResponseSuccess<JwtTokenDtoType> = {
        success: true,
        data: JwtTokenDto.parse({
            token: jwt.sign(jwtBody, apiConfig.jwtSecretKey)
        })
    };
    res.status(200).json(response);
}

export function refreshToken(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}

export function logout(_req: Request, res: Response, _next: NextFunction) {
    res.status(500).json({
        'message': 'NOT IMPLEMENTED'
    });
}
