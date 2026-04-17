import type { Route } from '@angular/router';

import { noAuthGuard } from '#/guards';
import { RegistrationPage } from '#/pages';


export const appRoutes: Route[] = [
    {
        path: 'register',
        component: RegistrationPage,
        canActivate: [noAuthGuard]
    },
    {
        path: '**',
        redirectTo: 'projects'
    }
];
