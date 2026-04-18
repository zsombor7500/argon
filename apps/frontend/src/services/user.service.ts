import {
    inject,
    effect,
    signal,
    Injectable,
    DestroyRef
} from '@angular/core';
import { timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '#/services';
import { getApiEndpoint } from '#/utils/frontend';
import { frontendConfig } from '#/configs/frontend';
import { UserProfileDto } from '#/dto/frontend/user';
import type { ApiResponse } from '#/dto/frontend/api';
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

    register(userCredentials: UserRegistrationDtoType): void {
        if (this.authService.isAuthenticated())
            return;
        this.isRegistratingSignal.set(true);
        this.errorSignal.set(null);
        this.httpClient
            .post<ApiResponse<any>>(this.endpoint, userCredentials)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (_) => this.isRegistratingSignal.set(false),
                error: (err) => {
                    if (err instanceof HttpErrorResponse && err.status === 409)
                        this.errorSignal.set('User already exists with given email!');
                    this.isRegistratingSignal.set(false)
                    console.error(`Failure during registration request: ${err}`);
                }
            });
    }

    getCurrentUser(): void {
        if (!this.authService.isAuthenticated())
            return;
        this.getUser(this.authService.tokenData()!.userObjId.toString());
    }

    getUser(userId: string): void {
        if (!this.authService.isAuthenticated())
            return;
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isLoadingSignal.set(true);
        this.userProfileSignal.set(null);
        this.errorSignal.set(null);
        this.httpClient
            .get<ApiResponse<UserProfileDtoType>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
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
                    this.errorSignal.set('Failed to retrieve user profile.');
                    this.isLoadingSignal.set(false);
                    console.error(`Failure during profile retrieval request: ${err}`);
                }
            });
    }

    updateCurrentUser(userData: UserUpdateDtoType) {
        if (!this.authService.isAuthenticated())
            return;
        this.updateUser(this.authService.tokenData()!.userObjId.toString(), userData);
    }

    updateUser(userId: string, userData: UserUpdateDtoType): void {
        if (!this.authService.isAuthenticated())
            return;
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        this.httpClient
            .patch<ApiResponse<UserProfileDtoType>>(finalEndpoint, userData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
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
                    this.errorSignal.set('Failed to update user profile.');
                    this.isUpdatingSignal.set(false);
                    console.error(`Failure during profile update request: ${err}`);
                }
            });
    }

    deleteCurrentUser(): void {
        if (!this.authService.isAuthenticated())
            return;
        this.deleteUser(this.authService.tokenData()!.userObjId.toString());
    }

    deleteUser(userId: string): void {
        if (!this.authService.isAuthenticated())
            return;
        const finalEndpoint = `${this.endpoint}/${userId}`;
        this.isDeletingSignal.set(true);
        this.userProfileSignal.set(null);
        this.errorSignal.set(null);
        this.httpClient
            .delete<ApiResponse<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
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
                    this.errorSignal.set('Failed to delete user profile.');
                    this.isDeletingSignal.set(false);
                    console.error(`Failure during profile deletion request: ${err}`);
                }
            });
    }
}
