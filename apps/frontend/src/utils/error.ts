import type { ApiResponseFailure } from '#/dto/frontend/api';
import { HttpErrorResponse } from '@angular/common/http';
import type { WritableSignal } from '@angular/core';


export function handleErrorResponse(
    error: any,
    errorSignal: WritableSignal<string | null> | null,
    processSignal: WritableSignal<boolean | null>
): void {
    processSignal.set(false);
    console.error(`Failure during request: ${error}`);
    if (errorSignal === null)
        return;
    const message = getErrorMessage(error);
    if (message !== undefined)
        errorSignal.set(message);
    else
        errorSignal.set('Action failed.');
}

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
