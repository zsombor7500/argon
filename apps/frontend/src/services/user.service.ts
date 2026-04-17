import {
    inject,
    effect,
    signal,
    Injectable,
    DestroyRef
} from '@angular/core';
import { timeout } from 'rxjs';
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
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);

    private userProfileSignal = signal<UserProfileDtoType | null>(null);
    private isRegistrationSuccessfulSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);

    readonly userProfile = this.userProfileSignal.asReadonly();
    readonly isRegistrationSuccessful = this.isRegistrationSuccessfulSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.userProfileSignal.set(null);
        });
        this.destroyRef.onDestroy(() => logoutEffectRef.destroy());
    }

    resetRegistrationSignals(): void {
        this.isRegistrationSuccessfulSignal.set(false);
        this.errorSignal.set(null);
    }

    register(userCredentials: UserRegistrationDtoType): void {
        if (this.authService.isAuthenticated())
            return;
        this.isRegistrationSuccessfulSignal.set(false);
        this.errorSignal.set(null);
        this.httpClient //'http://127.0.0.1:9000/api/v1/datasets'
            .post<ApiResponse<any>>(this.endpoint, userCredentials, { observe: 'body' })
            .pipe(timeout(frontendConfig.defaultTimeout))
            .subscribe({
                next: (_) => this.isRegistrationSuccessfulSignal.set(true),
                error: (err) => {
                    if (err instanceof HttpErrorResponse && err.status === 409)
                        this.errorSignal.set('User already exists with given email');
                    console.error(`Failure during registration request: ${err}`);
                }
            });
    }

    getProfile(): void {
        //if (!this.authService.isAuthenticated())
        //    return;
        //this.loadingSignal.set(true);
        //this.userProfileSignal.set(null);
        //this.errorSignal.set(null);
        //this.httpClient
        //    .get<ApiResponse<UserProfileDtoType>>(this.endpoint, {}, )
        //    .pipe(timeout(frontendConfig.defaultTimeout))
        //    .subscribe({
        //        next: (res) => {
        //            res = res as ApiResponseSuccess<UserProfileDtoType>;
        //            this.userProfileSignal.set(res.data);
        //            this.loadingSignal.set(false);
        //            console.log('Successfull profile retrieval!');
        //        },
        //        error: (err) => {
        //            this.loadingSignal.set(false);
        //            this.errorSignal.set('Failed to retrieve user profile.');
        //            console.error(`Failure during profile retrieval request: ${err}`);
        //        }
        //    });
    }
}
