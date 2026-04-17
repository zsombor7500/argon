import { timeout } from 'rxjs';
import { inject, signal, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '#/services';
import { getApiEndpoint } from '#/utils/frontend';
import { frontendConfig } from '#/configs/frontend';
import type { ApiResponse } from '#/dto/api';
import type { UserProfileDtoType, UserRegistrationDtoType } from '#/dto/user';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    private endpoint = getApiEndpoint(['users']);
    private httpClient = inject(HttpClient);
    private authService = inject(AuthService);

    private userProfileSignal = signal<UserProfileDtoType | null>(null);
    private isRegistrationSuccessfulSignal = signal<boolean>(false);
    private isLoadingSignal = signal(false);
    private errorSignal = signal<string | null>(null);

    readonly userProfile = this.userProfileSignal.asReadonly();
    readonly isRegistrationSuccessful = this.isRegistrationSuccessfulSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    resetSuccess(): void {
        this.isRegistrationSuccessfulSignal.set(false)
    }

    register(userCredentials: UserRegistrationDtoType): void {
        if (this.authService.isLoggedIn())
            return;
        this.isRegistrationSuccessfulSignal.set(false);
        this.errorSignal.set(null);
        this.httpClient
            .post<ApiResponse<any>>(this.endpoint, userCredentials, { observe: 'body' })
            .pipe(timeout(frontendConfig.defaultTimeout))
            .subscribe({
                next: (_) => {
                    this.isRegistrationSuccessfulSignal.set(true);
                    console.log('Successful registration');
                },
                error: (err) => {
                    if (err instanceof HttpErrorResponse && err.status === 422)
                        this.errorSignal.set('User already exists with given email');
                    console.error(`Failure during login request: ${err}`);
                }
            });
    }
}
