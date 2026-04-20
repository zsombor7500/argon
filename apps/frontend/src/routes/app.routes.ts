import type { Route } from '@angular/router';

import {
    NewProjectComponent,
    ProjectListComponent,
    UserInviteListComponent
} from '#/components/pages/projects';
import {
    LoginPage,
    RegistrationPage,
    ProjectPageComponent,
    ProjectsPageComponent
} from '#/components/pages';
import {
    ProjectTagListComponent,
    ProjectQueryListComponent,
    ProjectAccessListComponent,
    ProjectDatasetListComponent
} from '#/components/pages/project';
import { authGuard, noAuthGuard, projectAuthGuard } from '#/guards';


export const appRoutes: Route[] = [
    { path: 'login', component: LoginPage, canActivate: [noAuthGuard] },
    { path: 'register', component: RegistrationPage, canActivate: [noAuthGuard] },
    {
        path: 'projects',
        component: ProjectsPageComponent,
        canActivate: [authGuard],
        children: [
            { path: '', component: ProjectListComponent },
            { path: 'new', component: NewProjectComponent },
            { path: 'invites', component: UserInviteListComponent }
        ]
    },
    {
        path: 'projects/:id',
        component: ProjectPageComponent,
        canActivate: [projectAuthGuard],
        children: [
            { path: 'queries', component: ProjectQueryListComponent },
            { path: 'datasets', component: ProjectDatasetListComponent },
            { path: 'tags', component: ProjectTagListComponent },
            { path: 'access', component: ProjectAccessListComponent }
        ]
    },
    { path: '**', redirectTo: 'projects' }
];
