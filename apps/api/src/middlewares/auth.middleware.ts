import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

import { ApiError } from '#/exceptions/api';
import { apiConfig } from '#/configs/api';
import { JwtTokenBodyDto} from '#/dto/auth';
import { RES_LOCALS_JWT_KEY } from '#/constants/api';


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
