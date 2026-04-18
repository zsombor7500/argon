import { inject } from '@angular/core';
import type { HttpRequest, HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '#/services';
import { frontendConfig } from '#/configs/frontend';


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const isPublic = frontendConfig.noAuthEndpoints
        .some(({ method, prefix }) => req.method === method && req.url.includes(prefix));
    if (isPublic)
        next(req);
    const authService = inject(AuthService);
    const tokenData = authService.tokenData();
    if (tokenData !== null) {
        const newReq = req.clone({
            setHeaders: { Authorization: `${frontendConfig.tokenType} ${tokenData.accessToken}` }
        })
        return next(newReq);
    }
    return next(req);
};
