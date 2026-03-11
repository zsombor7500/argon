import type { Response } from 'express';

import { ApiError } from '#/exceptions/api';
import { JwtTokenBodyDto } from '#/dto/auth';
import { RES_LOCALS_JWT_KEY } from '#/constants/api';


export function jwtMatchesUserId(res: Response, userId: string): boolean {
    const jwtBody = JwtTokenBodyDto.safeParse(res.locals[RES_LOCALS_JWT_KEY])
    if (!jwtBody.success)
        throw new ApiError({
            details: { message: 'JWT token body parsing passed authentication middleware, but failed second parsing' }
        });
    return jwtBody.data.userId === userId
}
