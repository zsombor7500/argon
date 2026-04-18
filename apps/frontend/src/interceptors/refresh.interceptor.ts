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
import type { HttpRequest, HttpHandlerFn, HttpInterceptorFn, } from '@angular/common/http';

import { AuthService } from '#/services';
import { frontendConfig } from '#/configs/frontend';
import type { ApiResponseSuccess } from '#/dto/api';
import type { TokenRefreshDtoType } from '#/dto/auth';


const tokenDtoSubject = new BehaviorSubject<TokenRefreshDtoType | null>(null);

export const refreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const isPublic = frontendConfig.noAuthEndpoints
        .some(({ method, prefix }) => req.method === method && req.url.includes(prefix));
    const isAuth = req.url.includes(`/api/${frontendConfig.apiVersion}/auth`);
    if (isPublic || isAuth)
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
                        switchMap(tokenDto => {
                            const newReq = req.clone({
                                setHeaders: { Authorization: `${frontendConfig.tokenType} ${tokenDto.accessToken}` }
                            })
                            return next(newReq);
                        })
                    );
                return authService.refreshToken().pipe(
                    switchMap(response => {
                        response = response as ApiResponseSuccess<TokenRefreshDtoType>;
                        tokenDtoSubject.next(response.data);
                        const authReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${response.data.accessToken}` }
                        });
                        return next(authReq);
                    }),
                    catchError((err2: unknown) => {
                        authService.logout();
                        tokenDtoSubject.next(null);
                        return throwError(() => err2);
                    })
                )
            })
        );
};
