import type { HttpRequest, HttpHandlerFn, HttpInterceptorFn, } from '@angular/common/http';


export const withCredentialsInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const newReq = req.clone({
        withCredentials: true
    })
    return next(newReq);
};
