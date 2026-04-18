import { provideRouter } from '@angular/router';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';

import { appRoutes } from '#/routes/frontend';
import { authInterceptor } from '#/interceptors';


export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(appRoutes),
        provideHttpClient(
            withInterceptors([
                authInterceptor
            ])
        )
    ]
};
