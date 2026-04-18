import { provideRouter } from '@angular/router';
import { inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { withInterceptors, provideHttpClient } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';

import { appRoutes } from '#/routes/frontend';
import { refreshInterceptor, withCredentialsInterceptor } from '#/interceptors';
import { AuthService } from '#/services';


export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(appRoutes),
        provideHttpClient(
            withInterceptors([
                withCredentialsInterceptor,
                refreshInterceptor
            ])
        ),
        provideAppInitializer(() => inject(AuthService).refreshAuthState())
    ]
};
