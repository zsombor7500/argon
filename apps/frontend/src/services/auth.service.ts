import {
    of,
    map,
    timeout,
    catchError,
    Observable
} from 'rxjs';
import {
    inject,
    signal,
    effect,
    computed,
    Injectable,
    DestroyRef
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ToastService } from '#/services';
import { TokenBodyDto } from '#/dto/frontend/auth';
import { frontendConfig } from '#/configs/frontend';
import { TokenRefreshDto } from '#/dto/frontend/auth';
import { getApiEndpoint, handleErrorResponse } from '#/utils/frontend';
import type { ApiResponseSuccess } from '#/dto/frontend/api';
import type { UserLoginDtoType, TokenBodyDtoType, TokenRefreshDtoType } from '#/dto/frontend/auth';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private endpoint: string = getApiEndpoint(['auth']);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private httpClient = inject(HttpClient);
    private toastService = inject(ToastService);

    private tokenDataSignal = signal<TokenBodyDtoType | null>(null);
    private isLandingSignal = signal<boolean>(true);
    private isCheckingSignal = signal<boolean | null>(false);
    private isAuthenticatingSignal = signal<boolean | null>(false);
    private isRefreshingSignal = signal<boolean | null>(false);
    private isLoggingOutSignal = signal<boolean | null>(false);
    private successSignal = signal<string | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly tokenData = this.tokenDataSignal.asReadonly();
    readonly isLanding = this.isLandingSignal.asReadonly();
    readonly isChecking = this.isCheckingSignal.asReadonly();
    readonly isAuthenticating = this.isAuthenticatingSignal.asReadonly();
    readonly isRefreshing = this.isRefreshingSignal.asReadonly();
    readonly isLoggingOut = this.isLoggingOutSignal.asReadonly();
    readonly success = this.successSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.tokenDataSignal());

    constructor() {
        const successEffectRef = effect(() => {
            const success = this.success();
            if (success === null)
                return;
            this.toastService.addToast({
                type: 'success',
                message: success,
                duration: 3000
            });
            this.successSignal.set(null);
        });
        const errorEffectRef = effect(() => {
            const error = this.error();
            if (error === null)
                return;
            this.toastService.addToast({
                type: 'error',
                message: error,
                duration: 3000
            });
            this.errorSignal.set(null);
        });
        this.destroyRef.onDestroy(() => {
            successEffectRef.destroy();
            errorEffectRef.destroy();
        });
    }

    resetFeedbackSignals(): void {
        this.isCheckingSignal.set(null);
        this.isAuthenticatingSignal.set(null);
        this.isRefreshingSignal.set(null);
        this.isLoggingOutSignal.set(null);
        this.successSignal.set(null);
        this.errorSignal.set(null);
    }

    landed() {
        this.isLandingSignal.set(false);
    }

    resetAuthState() {
        this.tokenDataSignal.set(null);
    }

    checkAuthState(requiresAuth: boolean): Observable<TokenBodyDtoType | null> {
        this.resetAuthState();
        this.isCheckingSignal.set(true);
        return this.httpClient
            .post<ApiResponseSuccess<TokenBodyDtoType>>(`${this.endpoint}/status`, {})
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.landed();
                    this.isCheckingSignal.set(false);
                    const tokenBodyParse = TokenBodyDto.safeParse(res.data);
                    if (!tokenBodyParse.success) {
                        this.router.navigate(['/login'])
                            .catch(err => console.log(`Couldn't navigate to /login: ${err}`));
                        return null;
                    }
                    this.tokenDataSignal.set(tokenBodyParse.data);
                    return tokenBodyParse.data;
                }),
                catchError(_ => {
                    this.landed();
                    return this.refreshToken(requiresAuth);
                })
            );
    }

    login(userCredentials: UserLoginDtoType): Observable<TokenBodyDtoType | null> {
        this.resetAuthState();
        this.isAuthenticatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<TokenRefreshDtoType>>(`${this.endpoint}/login`, userCredentials)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isAuthenticatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse project data. Server response format mismatch.');
                        return null;
                    }
                    const tokenParse = TokenRefreshDto.safeParse(res.data);
                    if (!tokenParse.success) {
                        this.errorSignal.set('Failed to parse project data. Project data format mismatch.');
                        return null;
                    }
                    this.tokenDataSignal.set(tokenParse.data.tokenBody);
                    this.router.navigate(['/projects'])
                        .catch(err => console.log(`Couldn't navigate to /login: ${err}`));
                    this.successSignal.set('Successful login')
                    return tokenParse.data.tokenBody;
                }),
                catchError(err => {
                    if (!(err instanceof HttpErrorResponse)) {
                        console.error(`Failure during login request: ${err}`);
                        this.errorSignal.set('Network error');
                    } else if (err.status === 404) {
                        this.errorSignal.set('User does not exists with given email');
                    } else if (err.status === 422) {
                        this.errorSignal.set('Incorrect user credentials');
                    } else {
                        handleErrorResponse(err, this.errorSignal, this.isAuthenticatingSignal);
                    }
                    return of(null);
                })
            );
    }

    refreshToken(requiresAuth: boolean): Observable<TokenBodyDtoType | null> {
        this.isRefreshingSignal.set(true);
        return this.httpClient
            .post<ApiResponseSuccess<TokenRefreshDtoType>>(`${this.endpoint}/refresh`, {})
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isRefreshingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse project data. Server response format mismatch.');
                        return null;
                    }
                    const tokenParse = TokenRefreshDto.safeParse(res.data);
                    if (!tokenParse.success) {
                        this.errorSignal.set('Failed to parse project data. Project data format mismatch.');
                        return null;
                    }
                    this.tokenDataSignal.set(tokenParse.data.tokenBody);
                    return tokenParse.data.tokenBody;
                }),
                catchError(_ => {
                    this.isRefreshingSignal.set(false);
                    if (requiresAuth)
                        this.errorSignal.set('Login expired');
                    this.logoutClientside();
                    return of(null);
                })
            );
    }

    logoutClientside(): void {
        this.resetAuthState();
        this.router.navigate(['/login'])
            .catch(err => console.log(`Couldn't navigate to /login: ${err}`));
    }

    logout(): Observable<any> {
        this.isLoggingOutSignal.set(true);
        return this.httpClient
            .post<ApiResponseSuccess<any>>(`${this.endpoint}/logout`, {})
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(_ => {
                    this.logoutClientside();
                    this.successSignal.set('Successful logout')
                    this.isLoggingOutSignal.set(false);
                    return;
                }),
                catchError(err => {
                    this.logoutClientside();
                    this.successSignal.set('Successful logout')
                    return of(handleErrorResponse(err, null, this.isLoggingOutSignal));
                })
            );
    }
}
