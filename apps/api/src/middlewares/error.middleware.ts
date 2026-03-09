import type { Request, Response, NextFunction } from 'express'

import { logger } from '#/utils/api';
import { ApiError } from '#/exceptions/api';
import type { ApiResponse } from '#/dto/api';


export function errorHandler(error: Error | ApiError, _req: Request, res: Response, _next: NextFunction) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    logger.error(error.message, {
        statusCode: statusCode,
        details: error instanceof ApiError ? error.details : {}
    });
    const response: ApiResponse<any> = {
        success: false,
        error: error instanceof ApiError ? error.message : 'INTERNAL_ERROR'
    };
    return res.status(statusCode).json(response);
}
