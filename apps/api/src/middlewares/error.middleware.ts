import { mongo } from 'mongoose';
import type { Request, Response, NextFunction } from 'express';

import { logger } from '#/utils/api';
import { ApiError } from '#/exceptions/api';
import { apiConfig } from '#/configs/api';
import type { ApiResponse } from '#/dto/api';


export function errorHandler(error: Error | ApiError, _req: Request, res: Response, _next: NextFunction) {
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const cause = error.cause ? JSON.stringify(error.cause) : 'NONE';
    let details = 'NONE';
    if (error instanceof ApiError)
        details = JSON.stringify(error.details);
    else if (error instanceof mongo.MongoServerError)
        details = JSON.stringify(error.errorResponse);
    let stackTrace = 'NONE';
    if (!apiConfig.isProd && error.stack)
        stackTrace = error.stack;

    if (apiConfig.isProd)
        logger.error(
            error.message,
            {
                error: error.name,
                cause: cause,
                statusCode: statusCode,
                details: details,
                stackTrace: stackTrace
            }
        );
    else
        logger.error(
            `Error: ${error.name}  /  ` +
            `Message: ${error.message}  /  ` +
            `Cause: ${cause}  /  ` +
            `Status code: ${statusCode}  /  ` +
            `Details: ${details}  /  ` +
            `Stack trace: ${stackTrace}`
        );

    const response: ApiResponse<any> = {
        success: false,
        error: error instanceof ApiError ? error.message : 'INTERNAL_ERROR'
    };
    return res.status(statusCode).json(response);
}
