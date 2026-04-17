import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

import { AuthService } from '#/services';


export function noAuthGuard(): boolean | UrlTree {
    const router = inject(Router);
    const authService = inject(AuthService);
    return authService.isAuthenticated() ? router.parseUrl('/projects') : true;
};

