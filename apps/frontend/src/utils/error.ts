import type { ApiResponseFailure } from '#/dto/frontend/api';
import { HttpErrorResponse } from '@angular/common/http';


export function getErrorMessage(err: unknown): string | undefined {
    if (!(err instanceof HttpErrorResponse))
        return undefined;
    if (typeof err.error !== 'object')
        return undefined;
    const message = (err.error as ApiResponseFailure).error;
    if (typeof message !== 'string')
        return undefined;
    return message;
}
