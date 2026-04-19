import type { Route } from '@angular/router';

import { authGuard, noAuthGuard } from '#/guards';
import { LoginPage, ProjectsPage, RegistrationPage } from '#/components/pages';
import {
    NewProjectComponent,
    ProjectListingComponent,
    UserInviteListingComponent
} from '#/components/pages/projects';


export const appRoutes: Route[] = [
    { path: 'login', component: LoginPage, canActivate: [noAuthGuard] },
    { path: 'register', component: RegistrationPage, canActivate: [noAuthGuard] },
    {
        path: 'projects',
        component: ProjectsPage,
        canActivate: [authGuard],
        children: [
            { path: '', component: ProjectListingComponent },
            { path: 'new', component: NewProjectComponent },
            { path: 'invites', component: UserInviteListingComponent }
        ]
    },
    { path: '**', redirectTo: 'projects' }
];
