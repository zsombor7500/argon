import { provideRouter } from '@angular/router';
import { withInterceptors, provideHttpClient } from '@angular/common/http';
import { inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import type { ApplicationConfig } from '@angular/core';

import { appRoutes } from '#/routes/frontend';
import { AuthService, UserService } from '#/services';
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
        ),
        provideAppInitializer(() => {
            const userService = inject(UserService)
            inject(AuthService)
                .checkAuthState()
                .subscribe({
                    next: (_) => userService.getCurrentUserProfile(),
                    error: (_) => userService.resetCurrentUserProfile()
                });
        })
    ]
};
