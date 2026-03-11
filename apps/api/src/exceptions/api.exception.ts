export interface ApiErrorOptions {
    message?: string;
    statusCode?: number;
    errorCode?: string;
    details?: unknown;
}

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly details: unknown;

    constructor({
        message = 'Internal error',
        statusCode = 500,
        details = {}
    }: ApiErrorOptions) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

