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
import type { ApiResponse, ApiResponseSuccess } from '#/dto/api';
import type { UserLoginDtoType, TokenRefreshDtoType } from '#/dto/auth';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private endpoint: string = getApiEndpoint(['auth']);
    private router = inject(Router);
    private httpClient = inject(HttpClient);

    private tokenDataSignal = signal<TokenRefreshDtoType | null>(null);
    private errorSignal = signal<string | null>(null);
    private isRefreshingSignal = signal(false);

    readonly tokenData = this.tokenDataSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly isRefreshing = this.isRefreshingSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.tokenDataSignal());

    login(userCredentials: UserLoginDtoType): void {
        this.errorSignal.set(null);
        this.httpClient
            .post<ApiResponseSuccess<TokenRefreshDtoType>>(`${this.endpoint}/login`, userCredentials)
            .subscribe({
                next: (res) => {
                    this.tokenDataSignal.set(res.data);
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
    }

    refreshToken(): Observable<ApiResponse<TokenRefreshDtoType>> {
        this.isRefreshingSignal.set(true);
        const response = this.httpClient
            .post<ApiResponseSuccess<TokenRefreshDtoType>>(`${this.endpoint}/refresh`, {})
        response.subscribe({
                next: (res) => {
                    this.tokenDataSignal.set(res.data);
                    this.isRefreshingSignal.set(false);
                },
                error: (err) => {
                    console.error(`Failure during login request: ${err}`);
                    this.router.navigate(['/login'])
                        .catch(err => console.log(`Couldn't navigate to /login: ${err}`));
                    this.isRefreshingSignal.set(false);
                }
            });
        return response;
    }

    logout(): void {
        this.tokenDataSignal.set(null);
        this.router.navigate(['/login'])
            .catch(err => console.log(`Couldn't navigate to /login: ${err}`));
    }
}
