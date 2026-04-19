import {
    inject,
    effect,
    signal,
    Injectable,
    DestroyRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout, Observable } from 'rxjs';

import { AuthService } from '#/services';
import { frontendConfig } from '#/configs/frontend';
import { UserProfileDto } from '#/dto/frontend/user';
import { getApiEndpoint, getErrorMessage } from '#/utils/frontend';
import type { ApiResponseSuccess } from '#/dto/frontend/api';
import type { UserUpdateDtoType, UserProfileDtoType, UserRegistrationDtoType } from '#/dto/frontend/user';


@Injectable({
    providedIn: 'root'
})
export class UserService {
    private endpoint = getApiEndpoint(['users']);
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);

    private userProfileSignal = signal<UserProfileDtoType | null>(null);
    private isRegistratingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly userProfile = this.userProfileSignal.asReadonly();
    readonly isRegistrating = this.isRegistratingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.userProfileSignal.set(null);
        });
        this.destroyRef.onDestroy(() => logoutEffectRef.destroy());
    }

    resetFeedbackSignals(): void {
        this.isRegistratingSignal.set(null);
        this.isLoadingSignal.set(null);
        this.isUpdatingSignal.set(null);
        this.isDeletingSignal.set(null);
        this.errorSignal.set(null);
    }

    resetCurrentUserProfile() {
        this.userProfileSignal.set(null);
        this.resetFeedbackSignals();
    }

    register(userCredentials: UserRegistrationDtoType): Observable<ApiResponseSuccess<any>>  {
        this.isRegistratingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<any>>(this.endpoint, userCredentials)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
                next: (_) => this.isRegistratingSignal.set(false),
                error: (err) => {
                    const message = getErrorMessage(err);
                    if (message !== undefined)
                        this.errorSignal.set(message);
                    else
                        this.errorSignal.set('Failed to register user.');
                    this.isRegistratingSignal.set(false)
                    console.error(`Failure during registration request: ${err}`);
                }
            });
        return response;
    }

    getCurrentUserProfile(): Observable<ApiResponseSuccess<UserProfileDtoType>> {
        return this.getUserProfile(this.authService.tokenData()!.userObjId.toString());
    }

    getUserProfile(userId: string): Observable<ApiResponseSuccess<UserProfileDtoType>> {
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isLoadingSignal.set(true);
        this.userProfileSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .get<ApiResponseSuccess<UserProfileDtoType>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
                next: (res => {
                    if (!res.data)
                        this.errorSignal.set('Failed to parse user profile data. Server response format mismatch.');
                    const userProfileParse = UserProfileDto.safeParse(res.data);
                    if (!userProfileParse.success)
                        this.errorSignal.set('Failed to parse user profile data. User profile format mismatch.');
                    else
                        this.userProfileSignal.set(userProfileParse.data);
                    this.isLoadingSignal.set(false);
                }),
                error: (err) => {
                    const message = getErrorMessage(err);
                    if (message !== undefined)
                        this.errorSignal.set(message);
                    else
                        this.errorSignal.set('Failed to retrieve user profile.');
                    this.isLoadingSignal.set(false);
                    console.error(`Failure during profile retrieval request: ${err}`);
                }
            });
        return response;
    }

    updateCurrentUserProfile(userData: UserUpdateDtoType): Observable<ApiResponseSuccess<UserProfileDtoType>> {
        return this.updateUserProfile(this.authService.tokenData()!.userObjId.toString(), userData);
    }

    updateUserProfile(userId: string, userData: UserUpdateDtoType): Observable<ApiResponseSuccess<UserProfileDtoType>> {
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .patch<ApiResponseSuccess<UserProfileDtoType>>(finalEndpoint, userData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
                next: (res => {
                    if (!res.data)
                        this.errorSignal.set('Failed to parse user profile data. Server response format mismatch.');
                    const userProfileParse = UserProfileDto.safeParse(res.data);
                    if (!userProfileParse.success)
                        this.errorSignal.set('Failed to parse user profile data. User profile format mismatch.');
                    else
                        this.userProfileSignal.set(userProfileParse.data);
                    this.isUpdatingSignal.set(false);
                }),
                error: (err) => {
                    const message = getErrorMessage(err);
                    if (message !== undefined)
                        this.errorSignal.set(message);
                    else
                        this.errorSignal.set('Failed to update user profile.');
                    this.isUpdatingSignal.set(false);
                    console.error(`Failure during profile update request: ${err}`);
                }
            });
        return response;
    }

    deleteCurrentUser(): Observable<ApiResponseSuccess<any>> {
       return this.deleteUserProfile(this.authService.tokenData()!.userObjId.toString());
    }

    deleteUserProfile(userId: string): Observable<ApiResponseSuccess<any>> {
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isDeletingSignal.set(true);
        this.userProfileSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .delete<ApiResponseSuccess<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
                next: (res => {
                    if (!res.success)
                        this.errorSignal.set('Failed to delete user profile. Server response format mismatch.');
                    else {
                        this.userProfileSignal.set(null);
                        this.authService.logoutClientside();
                    }
                    this.isDeletingSignal.set(false);
                }),
                error: (err) => {
                    const message = getErrorMessage(err);
                    if (message !== undefined)
                        this.errorSignal.set(message);
                    else
                        this.errorSignal.set('Failed to delete user profile.');
                    this.isDeletingSignal.set(false);
                    console.error(`Failure during profile deletion request: ${err}`);
                }
            });
        return response;
    }
}
