import {
    map,
    timeout,
    Observable,
    catchError,
    of
} from 'rxjs';
import {
    inject,
    effect,
    signal,
    Injectable,
    DestroyRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService, ToastService } from '#/services';
import { frontendConfig } from '#/configs/frontend';
import { UserProfileDto } from '#/dto/frontend/user';
import { getApiEndpoint, handleErrorResponse } from '#/utils/frontend';
import type { ApiResponseSuccess } from '#/dto/frontend/api';
import type { UserUpdateDtoType, UserProfileDtoType, UserRegistrationDtoType } from '#/dto/frontend/user';
import { Router } from '@angular/router';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    private endpoint = getApiEndpoint(['users']);
    private router = inject(Router);
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    private userProfileSignal = signal<UserProfileDtoType | null>(null);
    private isRegistratingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private successSignal = signal<string | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly userProfile = this.userProfileSignal.asReadonly();
    readonly isRegistrating = this.isRegistratingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly success = this.successSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const authEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.userProfileSignal.set(null);
        });
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
            authEffectRef.destroy()
        });
    }

    resetFeedbackSignals(): void {
        this.isRegistratingSignal.set(null);
        this.isLoadingSignal.set(null);
        this.isUpdatingSignal.set(null);
        this.isDeletingSignal.set(null);
        this.successSignal.set(null);
        this.errorSignal.set(null);
    }

    resetCurrentUserProfile() {
        this.userProfileSignal.set(null);
        this.resetFeedbackSignals();
    }

    register(userCredentials: UserRegistrationDtoType): Observable<any> {
        this.isRegistratingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<any>>(this.endpoint, userCredentials)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(_ => {
                    this.isRegistratingSignal.set(false)
                    this.successSignal.set('Successful registration');
                    this.router.navigate(['/login'])
                        .catch(err => console.log(`Couldn't route to /login: ${err}`));
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isRegistratingSignal)))
            );
    }

    getCurrentUserProfile(): Observable<UserProfileDtoType | null> {
        return this.getUserProfile(this.authService.tokenData()!.userObjId.toString());
    }

    getUserProfile(userId: string): Observable<UserProfileDtoType | null> {
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isLoadingSignal.set(true);
        this.userProfileSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .get<ApiResponseSuccess<UserProfileDtoType>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isLoadingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse user profile data. Server response format mismatch.');
                        return null;
                    }
                    const userProfileParse = UserProfileDto.safeParse(res.data);
                    if (!userProfileParse.success) {
                        this.errorSignal.set('Failed to parse user profile data. User profile format mismatch.');
                        return null;
                    }
                    this.userProfileSignal.set(userProfileParse.data);
                    return userProfileParse.data;
                }),
                catchError((err) => {
                    handleErrorResponse(err, this.errorSignal, this.isLoadingSignal);
                    return of(null);
                })
            );
    }

    updateCurrentUserProfile(userData: UserUpdateDtoType): Observable<UserProfileDtoType | null> {
        return this.updateUserProfile(this.authService.tokenData()!.userObjId.toString(), userData);
    }

    updateUserProfile(userId: string, userData: UserUpdateDtoType): Observable<UserProfileDtoType | null> {
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .patch<ApiResponseSuccess<UserProfileDtoType>>(finalEndpoint, userData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isUpdatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse user profile data. Server response format mismatch.');
                        return null;
                    }
                    const userProfileParse = UserProfileDto.safeParse(res.data);
                    if (!userProfileParse.success) {
                        this.errorSignal.set('Failed to parse user profile data. User profile format mismatch.');
                        return null;
                    }
                    this.userProfileSignal.set(userProfileParse.data);
                    return userProfileParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal);
                    return of(null);
                })
            );
    }

    deleteCurrentUser(): Observable<any> {
       return this.deleteUserProfile(this.authService.tokenData()!.userObjId.toString());
    }

    deleteUserProfile(userId: string): Observable<any> {
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isDeletingSignal.set(true);
        this.userProfileSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .delete<ApiResponseSuccess<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isDeletingSignal.set(false);
                    if (!res.success) {
                        this.errorSignal.set('Failed to delete user profile. Server response format mismatch.');
                        return;
                    }
                    this.userProfileSignal.set(null);
                    this.authService.logoutClientside();
                }),
                catchError((err) => of(handleErrorResponse(err, this.errorSignal, this.isDeletingSignal)))
            );
    }
}
