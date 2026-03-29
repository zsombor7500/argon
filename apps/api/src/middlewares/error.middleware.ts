import type { Request, Response, NextFunction } from 'express'

import { logger } from '#/utils/api';
import { ApiError } from '#/exceptions/api';
import type { ApiResponse } from '#/dto/api';


export function errorHandler(error: Error | ApiError, _req: Request, res: Response, _next: NextFunction) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    logger.error(
        `Error: ${error.name}  /  ` +
        `Message: ${error.message}  /  ` +
        `Cause: ${error.cause ? JSON.stringify(error.cause) : 'NONE'}  /  ` +
        `Status code: ${statusCode}  /  ` +
        `Details: ${error instanceof ApiError ? JSON.stringify(error.details) : 'NONE'}`
    );
    const response: ApiResponse<any> = {
        success: false,
        error: error instanceof ApiError ? error.message : 'INTERNAL_ERROR'
    };
    return res.status(statusCode).json(response);
}
