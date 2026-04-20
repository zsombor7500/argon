import { inject } from '@angular/core';
import { of, map, catchError } from 'rxjs';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';

import { AuthService, ProjectService, UserService } from '#/services';


export function noAuthGuard() {
    const router = inject(Router);
    const authService = inject(AuthService);
    if (authService.isLanding()) {
        console.log('xd')
        return authService
            .checkAuthState()
            .pipe(
                map(res => {
                    if (res !== null)
                        return router.parseUrl('/projects');
                    else
                        return true;
                }),
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
            .checkAuthState()
            .pipe(
                map(res => {
                    if (res !== null) {
                        userService.getCurrentUserProfile();
                        return true;
                    }
                    else
                        return router.parseUrl('/login');
                }),
                catchError(_ => of(router.parseUrl('/login')))
            );
    return authService.isAuthenticated();
}

export function projectAuthGuard(route: ActivatedRouteSnapshot, _: RouterStateSnapshot) {
    const router = inject(Router);
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const projectService = inject(ProjectService);
    if (authService.isLanding())
        return authService
            .checkAuthState()
            .pipe(
                map(res => {
                    const projectId = route.paramMap.get('id');
                    if (res !== null && projectId !== null) {
                        userService.getCurrentUserProfile();
                        return projectService.getProject(projectId)
                        .pipe(
                            map(project => project === null ?
                                router.parseUrl('/login') : true
                            )
                        );
                    }
                    else
                        return router.parseUrl('/login');
                }),
                catchError(_ => of(router.parseUrl('/login')))
            );
    return authService.isAuthenticated();
}
