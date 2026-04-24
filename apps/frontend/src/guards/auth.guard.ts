import {
    of,
    map,
    switchMap,
    catchError
} from 'rxjs';
import { inject } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { AuthService, UserService, ProjectService } from '#/services';


export function noAuthGuard() {
    const router = inject(Router);
    const authService = inject(AuthService);
    if (authService.isLanding()) {
        return authService
            .checkAuthState(false)
            .pipe(
                map(res => res !== null ? router.parseUrl('/projects') : true),
                catchError(_ => of(true))
            );
    }
    return true;
}

export function authGuard() {
    const router = inject(Router);
    const authService = inject(AuthService);
    const userService = inject(UserService);
    if (authService.isLanding())
        return authService
            .checkAuthState(true)
            .pipe(
                map(res => {
                    if (res !== null) {
                        userService.getCurrentUserProfile().subscribe();
                        return true;
                    }
                    else
                        return router.parseUrl('/login');
                }),
                catchError(_ => of(router.parseUrl('/login')))
            )
    userService.getCurrentUserProfile().subscribe();
    return authService.isAuthenticated();
}

export function projectAuthGuard(route: ActivatedRouteSnapshot, _: RouterStateSnapshot) {
    const router = inject(Router);
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const projectService = inject(ProjectService);
    if (authService.isLanding()) {
        return authService
            .checkAuthState(true)
            .pipe(
                switchMap(res => {
                    if (res === null)
                        return of(router.parseUrl('/login'))
                    userService.getCurrentUserProfile().subscribe();
                    const projectId = route.paramMap.get('id');
                    if (projectId !== null) {
                        const res = projectService.getProject(projectId)
                            .pipe(
                                map(project => project === null ? router.parseUrl('/projects') : true),
                                catchError(_ => of(router.parseUrl('/projects')))
                            );
                        res.subscribe();
                        return res;
                    }
                    else
                        return of(router.parseUrl('/projects'));
                }),
                catchError(_ => of(router.parseUrl('/login')))
            );
    }
    if (!authService.isAuthenticated())
        return router.parseUrl('/login');
    userService.getCurrentUserProfile().subscribe();
    const projectId = route.paramMap.get('id');
    if (projectId === null)
        return router.parseUrl('/projects');
    const res = projectService.getProject(projectId)
        .pipe(
            map(project => project === null ? router.parseUrl('/projects') : true),
            catchError(_ => of(router.parseUrl('/projects')))
        );
    res.subscribe();
    return res;
}
