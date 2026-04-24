import {
    take,
    filter,
    switchMap,
    catchError,
    throwError,
    BehaviorSubject
} from 'rxjs';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import type { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '#/services';
import { frontendConfig } from '#/configs/frontend';
import type { TokenBodyDtoType } from '#/dto/frontend/auth';


const tokenDtoSubject = new BehaviorSubject<TokenBodyDtoType | null>(null);

export const refreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const isSkipped = frontendConfig.interceptorSkipEndpoints
        .find(({ method, prefix }) => req.method === method && req.url.includes(prefix));
    if (isSkipped)
        return next(req);
    const authService = inject(AuthService);
    return next(req)
        .pipe(
            catchError((err: unknown) => {
                if (!(err instanceof HttpErrorResponse) || (err instanceof HttpErrorResponse && err.status !== 401))
                    return throwError(() => err);
                if (authService.isRefreshing())
                    return tokenDtoSubject.pipe(
                        filter(tokenDto => tokenDto !== null),
                        take(1),
                        switchMap(_ => next(req))
                    );
                return authService.refreshToken(true).pipe(
                    switchMap(res => {
                        if (res === null)
                            return next(req);
                        tokenDtoSubject.next(res);
                        return next(req);
                    }),
                    catchError((err2: unknown) => {
                        tokenDtoSubject.next(null);
                        return throwError(() => err2);
                    })
                )
            })
        );
};
