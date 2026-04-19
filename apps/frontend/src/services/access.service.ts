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
import { getApiEndpoint } from '#/utils/frontend';
import { frontendConfig } from '#/configs/frontend';
import { handleErrorResponse } from '#/utils/frontend';
import { AccessDto, RoleToUserObjIdsMap } from '#/dto/frontend/access';
import type {
    AccessDtoType,
    RoleToScopesMapType,
    UserRoleUpdateDtoType,
    RoleToUserObjIdsMapType
} from '#/dto/frontend/access';
import type { InviteDtoType } from '#/dto/frontend/invite';
import type { UserProfileDtoType } from '#/dto/frontend/user';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';


@Injectable({
    providedIn: 'root'
})
export class AccessService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);

    private usersSignal = signal<UserProfileDtoType[] | null>(null);
    private projectInvitesSignal = signal<InviteDtoType[] | null>(null);
    private roleToScopesMapSignal = signal<RoleToScopesMapType[] | null>(null);
    private roleToUserIdsMapSignal = signal<RoleToUserObjIdsMapType | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isRemovingSignal = signal<boolean | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly users = this.usersSignal.asReadonly();
    readonly projectInvites = this.projectInvitesSignal.asReadonly();
    readonly roleToScopesMap = this.roleToScopesMapSignal.asReadonly();
    readonly roleToUserIdsMap = this.roleToUserIdsMapSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isRemoving = this.isRemovingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated) {
                this.usersSignal.set(null);
                this.projectInvitesSignal.set(null);
                this.roleToScopesMapSignal.set(null);
                this.roleToUserIdsMapSignal.set(null);
            }
        });
        this.destroyRef.onDestroy(() => logoutEffectRef.destroy());
    }

    resetFeedbackSignals(): void {
        this.isLoadingSignal.set(null);
        this.isUpdatingSignal.set(null);
        this.isRemovingSignal.set(null);
        this.errorSignal.set(null);
    }

    getAccesses(projectId: string): Observable<ApiResponseSuccess<AccessDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'access']);
        this.isLoadingSignal.set(true);
        this.usersSignal.set(null);
        this.projectInvitesSignal.set(null);
        this.roleToScopesMapSignal.set(null);
        this.roleToUserIdsMapSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .get<ApiResponseSuccess<AccessDtoType>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse access data. Server response format mismatch.');
                const accessParse = AccessDto.safeParse(res.data);
                if (!accessParse.success)
                    this.errorSignal.set('Failed to parse access data. Access data format mismatch.');
                else
                    this.usersSignal.set(accessParse.data.users);
                this.isLoadingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isLoadingSignal)
        });
        return response;
    }

    updateUserRole(projectId: string, userId: string, roleMap: UserRoleUpdateDtoType): Observable<ApiResponse<RoleToUserObjIdsMapType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'access', userId]);
        this.isUpdatingSignal.set(true);
        this.roleToUserIdsMapSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .patch<ApiResponseSuccess<RoleToUserObjIdsMapType>>(finalEndpoint, roleMap)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse query data. Server response format mismatch.');
                const roleToUserIdsMapParse = RoleToUserObjIdsMap.safeParse(res.data);
                if (!roleToUserIdsMapParse.success)
                    this.errorSignal.set('Failed to parse query data. Query data format mismatch.');
                else
                    this.roleToUserIdsMapSignal.set(roleToUserIdsMapParse.data);
                this.isUpdatingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal)
        });
        return response;
    }

    removeUserFromProject(projectId: string, userId: string): Observable<ApiResponse<RoleToUserObjIdsMapType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'access', userId]);
        this.isRemovingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .delete<ApiResponse<RoleToUserObjIdsMapType>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.success)
                    this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                else {
                    this.usersSignal.update(arr => [...(arr ?? []).filter(u => u._id !== userId)]);
                    this.roleToUserIdsMapSignal.set(res.data);
                }
                this.isRemovingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isRemovingSignal)
        });
        return response;
    }
}
