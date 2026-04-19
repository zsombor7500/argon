import {
    signal,
    inject,
    computed,
    Injectable,
    DestroyRef
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { frontendConfig } from '#/configs/frontend';
import { getApiEndpoint, handleErrorResponse } from '#/utils/frontend';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { UserLoginDtoType, TokenBodyDtoType, TokenRefreshDtoType } from '#/dto/frontend/auth';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private endpoint: string = getApiEndpoint(['auth']);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private httpClient = inject(HttpClient);

    private tokenDataSignal = signal<TokenBodyDtoType | null>(null);
    private isLandingSignal = signal<boolean>(true);
    private isCheckingSignal = signal<boolean | null>(false);
    private isAuthenticatingSignal = signal<boolean | null>(false);
    private isRefreshingSignal = signal<boolean | null>(false);
    private isLoggingOutSignal = signal<boolean | null>(false);
    private errorSignal = signal<string | null>(null);

    readonly tokenData = this.tokenDataSignal.asReadonly();
    readonly isLanding = this.isLandingSignal.asReadonly();
    readonly isChecking = this.isCheckingSignal.asReadonly();
    readonly isAuthenticating = this.isAuthenticatingSignal.asReadonly();
    readonly isRefreshing = this.isRefreshingSignal.asReadonly();
    readonly isLoggingOut = this.isLoggingOutSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.tokenDataSignal());

    resetFeedbackSignals(): void {
        this.isCheckingSignal.set(null);
        this.isAuthenticatingSignal.set(null);
        this.isRefreshingSignal.set(null);
        this.isLoggingOutSignal.set(null);
        this.errorSignal.set(null);
    }

    landed() {
        this.isLandingSignal.set(false);
    }

    resetAuthState() {
        this.tokenDataSignal.set(null);
    }

    checkAuthState(): Observable<ApiResponseSuccess<TokenBodyDtoType>> {
        this.resetAuthState();
        this.isCheckingSignal.set(true);
        const response = this.httpClient
            .post<ApiResponseSuccess<TokenBodyDtoType>>(`${this.endpoint}/status`, {})
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res) => {
                this.tokenDataSignal.set(res.data);
                this.isCheckingSignal.set(false);
                this.router.navigate(['/projects'])
                    .catch(err => console.log(`Couldn't navigate to /projects: ${err}`));
            },
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isCheckingSignal)
        });
        return response;
    }

    login(userCredentials: UserLoginDtoType): Observable<ApiResponseSuccess<TokenRefreshDtoType>> {
        this.resetAuthState();
        this.isAuthenticatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<TokenRefreshDtoType>>(`${this.endpoint}/login`, userCredentials)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res) => {
                this.tokenDataSignal.set(res.data.tokenBody);
                this.isAuthenticatingSignal.set(false);
                this.router.navigate(['/projects'])
                    .catch(err => console.log(`Couldn't navigate to /login: ${err}`));
            },
            error: (err) => {
                if (!(err instanceof HttpErrorResponse)) {
                    console.error(`Failure during login request: ${err}`);
                    return;
                }
                if (err.status === 404) {
                    this.errorSignal.set('User does not exists with given email!');
                    return;
                }
                if (err.status === 422) {
                    this.errorSignal.set('Incorrect user credentials!');
                    return;
                }
                handleErrorResponse(err, this.errorSignal, this.isAuthenticatingSignal);
            }
        });
        return response;
    }

    refreshToken(): Observable<ApiResponse<TokenRefreshDtoType>> {
        this.isRefreshingSignal.set(true);
        const response = this.httpClient
            .post<ApiResponseSuccess<TokenRefreshDtoType>>(`${this.endpoint}/refresh`, {})
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res) => {
                this.tokenDataSignal.set(res.data.tokenBody);
                this.isRefreshingSignal.set(false);
            },
            error: (err) => {
                this.logoutClientside();
                handleErrorResponse(err, this.errorSignal, this.isRefreshingSignal);
            }
        });
        return response;
    }

    logoutClientside(): void {
        this.resetAuthState();
        this.router.navigate(['/login'])
            .catch(err => console.log(`Couldn't navigate to /login: ${err}`));
    }

    logout(): Observable<ApiResponseSuccess<any>> {
        this.isLoggingOutSignal.set(true);
        const response = this.httpClient
            .post<ApiResponseSuccess<any>>(`${this.endpoint}/logout`, {})
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (_) => {
                this.logoutClientside();
                this.isLoggingOutSignal.set(false);
            },
            error: (err) => {
                this.logoutClientside();
                handleErrorResponse(err, this.errorSignal, this.isLoggingOutSignal);
            }
        });
        return response;
    }
}
