import { Types } from 'mongoose';
import type { Response } from 'express';
import type { ZodSafeParseResult } from 'zod';

import { JwtTokenBodyDto  } from '#/dto/auth';
import { RES_LOCALS_JWT_KEY } from '#/constants/api';
import type { JwtTokenBodyDtoType  } from '#/dto/auth';


export function jwtMatchesUserObjId(res: Response, userObjId: Types.ObjectId): boolean {
    const jwtBody = res.locals[RES_LOCALS_JWT_KEY] as JwtTokenBodyDtoType;
    return jwtBody.userObjId.equals(userObjId);
}

export function getJwtBody(res: Response): ZodSafeParseResult<JwtTokenBodyDtoType> {
    return JwtTokenBodyDto.safeParse(res.locals[RES_LOCALS_JWT_KEY]);
}
