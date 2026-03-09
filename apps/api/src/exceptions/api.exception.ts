export interface ApiErrorOptions {
    message: string;
    statusCode?: number;
    errorCode?: string;
    details?: object;
}

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly details: object;

    constructor({
        message,
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

