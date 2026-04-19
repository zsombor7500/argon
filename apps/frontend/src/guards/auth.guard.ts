import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { AuthService, UserService } from '#/services';


export function authGuard(): boolean | UrlTree {
    const router = inject(Router);
    const authService = inject(AuthService);
    const routingDecision = authService.isAuthenticated() ? true : router.parseUrl('/login');
    if (routingDecision === true && authService.isLanding()) {
        inject(UserService).getCurrentUserProfile();
        authService.landed();
    }
    return routingDecision;
};

export function noAuthGuard(): boolean | UrlTree {
    const router = inject(Router);
    const authService = inject(AuthService);
    return authService.isAuthenticated() ? router.parseUrl('/projects') : true;
};

