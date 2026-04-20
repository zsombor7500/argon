import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

import {
    TokenBodyDto,
    UserLoginDto,
    TokenRefreshDto,
    RefreshTokenCoookies
} from '#/dto/auth';
import { User } from '#/db/models';
import { ApiError } from '#/exceptions/api';
import { apiConfig } from '#/configs/api';
import { getJwtBody, getSha512Hash } from '#/utils/api';
import { verifyBcryptHash } from '#/utils/api';
import type { IUser } from '#/db/interfaces';
import type { ApiResponseSuccess } from '#/dto/api';
import type { TokenBodyDtoType, TokenRefreshDtoType } from '#/dto/auth';


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
            statusCode: 404,
            details: { email: userLogin.data.email }
        }));
    // Password validation
    if (!await verifyBcryptHash(userLogin.data.password, user.passwordHash))
        return next(new ApiError({
            message: 'Incorrect user credentials',
            statusCode: 422
        }));
    // Expired refresh token removal
    user.refreshTokenHashes = new Map(
        user.refreshTokenHashes
            .entries()
            .filter(([_, exp]) => exp >= Date.now())
    );
    // Refresh token gen + collision check + access token gen
    const timestamp = Date.now();
    const refreshTokenBody: TokenBodyDtoType = {
        iat: timestamp,
        exp: timestamp + apiConfig.refreshJwtExpiry * 1000,
        userObjId: user._id
    };
    const refreshToken = jwt.sign(refreshTokenBody, apiConfig.refreshJwtSecret);
    const refreshTokenHash = getSha512Hash(refreshToken);
    if (user.refreshTokenHashes.get(refreshTokenHash))
        return next(new ApiError({
            details: {
                message: 'Hash collision during the insertion of JWT refresh token hash',
                refreshTokenHash: refreshTokenHash
            }
        }));
    const accessTokenBody: TokenBodyDtoType = {
        iat: timestamp,
        exp: timestamp + apiConfig.accessJwtExpiry * 1000,
        userObjId: user._id
    };
    const accessToken = jwt.sign(accessTokenBody, apiConfig.accessJwtSecret);
    user.refreshTokenHashes.set(refreshTokenHash, refreshTokenBody.exp);
    await user.save();

    // Response
    const response: ApiResponseSuccess<TokenRefreshDtoType> = {
        success: true,
        data: TokenRefreshDto.parse({
            tokenBody: accessTokenBody
        })
    };
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: apiConfig.isSecure,
        sameSite: true,
        maxAge: apiConfig.accessJwtExpiry * 1000,
        path: `/api/${apiConfig.version}`
    }).cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: apiConfig.isSecure,
        sameSite: true,
        maxAge: apiConfig.refreshJwtExpiry * 1000,
        path: `/api/${apiConfig.version}/auth`
    }).status(200)
      .json(response);
}

export async function refreshTokens(req: Request, res: Response, next: NextFunction) {
    // Validation
    const cookies = RefreshTokenCoookies.safeParse(req.cookies);
    if (!cookies.success)
        return next(new ApiError({
            message: 'Missing refresh token cookie',
            statusCode: 422,
            details: { error: cookies.error }
        }));
    let jwtBody: string | JwtPayload;
    try {
        jwtBody = jwt.verify(cookies.data.refreshToken, apiConfig.refreshJwtSecret)
    } catch (err) {
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: err
        }));
    }
    const jwtBodyParse = TokenBodyDto.safeParse(jwtBody);
    if (!jwtBodyParse.success)
        return next(new ApiError({
            message: 'Malformed refresh token body',
            statusCode: 401,
            details: jwtBody
        }));
    if (jwtBodyParse.data.exp < Date.now())
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: {
                message: 'User tried using an expired refresh token',
                jwtBody: jwtBodyParse.data
            }
        }));
    const user = await User.findById(jwtBodyParse.data.userObjId);
    if (!user)
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: {
                message: 'User tried acting on behalf of a non-existent, most likely deleted user',
                jwtBody: jwtBodyParse.data
            }
        }));
    // Expired refresh token removal + checking for token reusal
    user.refreshTokenHashes = new Map(
        user.refreshTokenHashes
            .entries()
            .filter(([_, exp]) => exp >= Date.now())
    );
    const refreshTokenHash = getSha512Hash(cookies.data.refreshToken);
    const tokenMatch = user.refreshTokenHashes
        .entries()
        .find(([tokenHash, _]) => tokenHash === refreshTokenHash);
    if (!tokenMatch)
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: {
                message: 'User tried reusing invalidated token',
                jwtBody: jwtBodyParse.data
            }
        }));
    // Old refresh token removal + refresh token gen + collision check + access token gen
    user.refreshTokenHashes.delete(refreshTokenHash);
    const timestamp = Date.now();
    const newRefreshTokenBody: TokenBodyDtoType = {
        iat: timestamp,
        exp: timestamp + apiConfig.refreshJwtExpiry * 1000,
        userObjId: user._id
    };
    const newRefreshToken = jwt.sign(newRefreshTokenBody, apiConfig.refreshJwtSecret);
    const newRefreshTokenHash = getSha512Hash(newRefreshToken);
    if (user.refreshTokenHashes.get(newRefreshTokenHash))
        return next(new ApiError({
            details: {
                message: 'Hash collision during the insertion of JWT refresh token hash',
                refreshTokenHash: newRefreshTokenHash
            }
        }));
    const newAccessTokenBody: TokenBodyDtoType = {
        iat: timestamp,
        exp: timestamp + apiConfig.accessJwtExpiry * 1000,
        userObjId: user._id
    };
    const newAccessToken = jwt.sign(newAccessTokenBody, apiConfig.accessJwtSecret);
    user.refreshTokenHashes.set(newRefreshTokenHash, newRefreshTokenBody.exp);
    await user.save();

    // Response
    const response: ApiResponseSuccess<TokenRefreshDtoType> = {
        success: true,
        data: TokenRefreshDto.parse({
            tokenBody: newAccessTokenBody
        })
    };
    res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: apiConfig.isSecure,
        sameSite: true,
        maxAge: apiConfig.accessJwtExpiry * 1000,
        path: `/api/${apiConfig.version}`
    }).cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: apiConfig.isSecure,
        sameSite: true,
        maxAge: apiConfig.refreshJwtExpiry * 1000,
        path: `/api/${apiConfig.version}/auth`
    }).status(200)
      .json(response);
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    // Validation
    const cookies = RefreshTokenCoookies.safeParse(req.cookies);
    if (!cookies.success)
        return next(new ApiError({
            message: 'Missing refresh token cookie',
            statusCode: 422,
            details: { error: cookies.error }
        }));
    let jwtBody: string | JwtPayload;
    try {
        jwtBody = jwt.verify(cookies.data.refreshToken, apiConfig.refreshJwtSecret);
    } catch (err) {
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: {
                message: 'JWT token failed verification',
                error: err
            }
        }));
    }
    const jwtBodyParse = TokenBodyDto.safeParse(jwtBody);
    if (!jwtBodyParse.success)
        return next(new ApiError({
            message: 'Malformed refresh token body',
            statusCode: 401,
            details: jwtBody
        }));
    if (jwtBodyParse.data.exp < Date.now())
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: {
                message: 'User tried using an expired refresh token',
                jwtBody: jwtBodyParse.data
            }
        }));

    // Expired token + provided token's removal
    const user = await User.findById(jwtBodyParse.data.userObjId);
    if (!user)
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: {
                message: 'User tried acting on behalf of a non-existent, most likely deleted user',
                jwtBody: jwtBodyParse.data
            }
        }));
    user.refreshTokenHashes = new Map(
        user.refreshTokenHashes
            .entries()
            .filter(([_, exp]) => exp >= Date.now())
    );
    const refreshTokenHash = getSha512Hash(cookies.data.refreshToken);
    const tokenMatch = user.refreshTokenHashes
        .entries()
        .find(([tokenHash, _]) => tokenHash === refreshTokenHash);
    if (!tokenMatch)
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: {
                message: 'User tried reusing invalidated token',
                jwtBody: jwtBodyParse.data
            }
        }));
    user.refreshTokenHashes = new Map(
        user.refreshTokenHashes
            .entries()
            .filter(([tokenHash, _]) => tokenHash !== refreshTokenHash)
    );
    await user.save();

    // Response
    const response: ApiResponseSuccess<any> = {
        success: true,
        data: {}
    };
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: apiConfig.isSecure,
        sameSite: true,
        path: `/api/${apiConfig.version}`
    }).clearCookie('refreshToken', {
        httpOnly: true,
        secure: apiConfig.isSecure,
        sameSite: true,
        path: `/api/${apiConfig.version}/auth`
    }).status(200)
      .json(response);
}

export async function status(_req: Request, res: Response, next: NextFunction) {
    const jwtBody = getJwtBody(res);
    const user: IUser | null = await User.findOne({
        _id: jwtBody.userObjId
    });
    if (!user)
        return next(new ApiError({
            message: 'Forbidden',
            statusCode: 403,
            details: {
                message: 'User tried using an expired refresh token',
                jwtBody: jwtBody
            }
        }));
    const response: ApiResponseSuccess<TokenBodyDtoType> = {
        success: true,
        data: TokenBodyDto.parse(jwtBody)
    };
    return res.status(200)
        .json(response);
}
