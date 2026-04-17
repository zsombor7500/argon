import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from '#/services';


export function authGuard(): boolean | UrlTree {
    const router = inject(Router);
    const authService = inject(AuthService);
    return authService.isAuthenticated() ? true : router.parseUrl('/login');
};

export function noAuthGuard(): boolean | UrlTree {
    const router = inject(Router);
    const authService = inject(AuthService);
    return authService.isAuthenticated() ? router.parseUrl('/projects') : true;
};

