import type { Request, Response, NextFunction } from 'express';

import { ApiError } from '#/exceptions/api';


export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
    return next(new ApiError({
        message: 'Not found',
        statusCode: 404,
        details: {}
    }));
}
