import type { Response } from 'express';

import { ApiError } from '#/exceptions/api';
import { JwtTokenBodyDto  } from '#/dto/auth';
import { RES_LOCALS_JWT_KEY } from '#/constants/api';
import type { JwtTokenBodyDtoType  } from '#/dto/auth';


export function getJwtBody(res: Response): JwtTokenBodyDtoType {
    const parse = JwtTokenBodyDto.safeParse(res.locals[RES_LOCALS_JWT_KEY]);
    if (!parse.success)
        throw new ApiError({ details: parse.error.issues });
    return parse.data;
}
