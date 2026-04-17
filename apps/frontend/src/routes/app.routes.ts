import type { Route } from '@angular/router';

import { authGuard, noAuthGuard } from '#/guards';
import { LoginPage, ProjectsPage, RegistrationPage } from '#/components/pages';


export const appRoutes: Route[] = [
    {
        path: 'login',
        component: LoginPage,
        canActivate: [noAuthGuard]
    },
    {
        path: 'register',
        component: RegistrationPage,
        canActivate: [noAuthGuard]
    },
    {
        path: 'projects',
        component: ProjectsPage,
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'projects'
    }
];
