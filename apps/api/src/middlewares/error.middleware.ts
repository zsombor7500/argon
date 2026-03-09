import type { Request, Response, NextFunction } from 'express'

import { logger } from '#/utils/api';
import { ApiError } from '#/exceptions/api';
import type { ApiResponse } from '#/dto/api';


export function errorHandler(error: ApiError, _req: Request, res: Response, _next: NextFunction) {
    logger.error(error.message, {
        statusCode: error.statusCode,
        details: error.details
    });
    const resBody: ApiResponse<any> = {
        success: false,
        error: error.message
    };
    return res.status(error.statusCode).json(resBody);
}
