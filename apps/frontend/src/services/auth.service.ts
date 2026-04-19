import {
    signal,
    inject,
    computed,
    Injectable
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { getApiEndpoint } from '#/utils/frontend';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { UserLoginDtoType, TokenRefreshDtoType, TokenBodyDtoType } from '#/dto/frontend/auth';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private endpoint: string = getApiEndpoint(['auth']);
    private router = inject(Router);
    private httpClient = inject(HttpClient);

    private tokenDataSignal = signal<TokenBodyDtoType | null>(null);
    private errorSignal = signal<string | null>(null);
    private isRefreshingSignal = signal(false);

    readonly tokenData = this.tokenDataSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly isRefreshing = this.isRefreshingSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.tokenDataSignal());

    resetAuthState() {
        this.tokenDataSignal.set(null);
    }

    refreshAuthState(): Observable<ApiResponseSuccess<TokenBodyDtoType>> {
        this.resetAuthState();
        const response = this.httpClient
            .post<ApiResponseSuccess<TokenBodyDtoType>>(`${this.endpoint}/status`, {});
        response.subscribe({
                next: (res) => {
                    this.tokenDataSignal.set(res.data);
                    this.router.navigate(['/projects'])
                        .catch(err => console.log(`Couldn't navigate to /projects: ${err}`));
                },
                error: (err) => {
                    if (!(err instanceof HttpErrorResponse))
                        console.error(`Uncrecognized failure during login request: ${err}`);
                }
            });
        return response;
    }

    login(userCredentials: UserLoginDtoType): Observable<ApiResponseSuccess<TokenRefreshDtoType>> {
        this.resetAuthState();
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<TokenRefreshDtoType>>(`${this.endpoint}/login`, userCredentials);
        response.subscribe({
                next: (res) => {
                    this.tokenDataSignal.set(res.data.tokenBody);
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
                    console.error(`Uncrecognized failure during login request: ${err.message}`);
                }
            });
        return response;
    }

    refreshToken(): Observable<ApiResponse<TokenRefreshDtoType>> {
        this.isRefreshingSignal.set(true);
        const response = this.httpClient
            .post<ApiResponseSuccess<TokenRefreshDtoType>>(`${this.endpoint}/refresh`, {});
        response.subscribe({
                next: (res) => {
                    this.tokenDataSignal.set(res.data.tokenBody);
                    this.isRefreshingSignal.set(false);
                },
                error: (err) => {
                    this.logoutClientside();
                    this.isRefreshingSignal.set(false);
                    console.error(`Failure during login request: ${err}`);
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
        const response = this.httpClient
            .post<ApiResponseSuccess<any>>(`${this.endpoint}/logout`, {});
        response.subscribe({
                next: (_) => {
                    this.logoutClientside();
                },
                error: (err) => {
                    this.logoutClientside();
                    console.error(`Failure during logout request: ${err}`);
                }
            });
        return response;
    }
}
