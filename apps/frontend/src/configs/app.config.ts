import { provideRouter } from '@angular/router';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { withInterceptors, provideHttpClient } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';

import { appRoutes } from '#/routes/frontend';
import { refreshInterceptor, withCredentialsInterceptor } from '#/interceptors';


export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(appRoutes),
        provideHttpClient(
            withInterceptors([
                withCredentialsInterceptor,
                refreshInterceptor
            ])
        )
    ]
};
