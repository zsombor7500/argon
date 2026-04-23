import {
    of,
    map,
    timeout,
    catchError,
    Observable
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

import { getApiEndpoint } from '#/utils/frontend';
import { frontendConfig } from '#/configs/frontend';
import { handleErrorResponse } from '#/utils/frontend';
import { AuthService, ProjectService } from '#/services';
import { AccessDto, RoleToUserObjIdsMap } from '#/dto/frontend/access';
import type {
    AccessDtoType,
    RoleToScopesMapType,
    UserRoleUpdateDtoType,
    RoleToUserObjIdsMapType
} from '#/dto/frontend/access';
import type { UserProfileDtoType } from '#/dto/frontend/user';
import type { ApiResponseSuccess } from '#/dto/frontend/api';
import type { ProjectInviteDtoType } from '#/dto/frontend/invite';


@Injectable({
    providedIn: 'root'
})
export class AccessService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);
    private projectService = inject(ProjectService);

    private usersSignal = signal<UserProfileDtoType[] | null>(null);
    private projectInvitesSignal = signal<ProjectInviteDtoType[] | null>(null);
    private roleToScopesMapSignal = signal<RoleToScopesMapType | null>(null);
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

    getCurrentProjectAccesses(): Observable<AccessDtoType | null> {
        return this.getAccesses(this.projectService.selectedProject()?._id ?? '');
    }


    getAccesses(projectId: string): Observable<AccessDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'access']);
        this.isLoadingSignal.set(true);
        this.usersSignal.set(null);
        this.projectInvitesSignal.set(null);
        this.roleToScopesMapSignal.set(null);
        this.roleToUserIdsMapSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .get<ApiResponseSuccess<AccessDtoType>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isLoadingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse access data. Server response format mismatch.');
                        return null;
                    }
                    const accessParse = AccessDto.safeParse(res.data);
                    if (!accessParse.success) {
                        this.errorSignal.set('Failed to parse access data. Access data format mismatch.');
                        return null;
                    }
                    this.usersSignal.set(accessParse.data.users);
                    this.projectInvitesSignal.set(accessParse.data.invites);
                    this.roleToScopesMapSignal.set(accessParse.data.roleToScopesMap);
                    this.roleToUserIdsMapSignal.set(accessParse.data.roleToUserObjIdsMap);
                    return accessParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isLoadingSignal);
                    return of(null);
                })
            );
    }

    updateUserRole(projectId: string, userId: string, roleMap: UserRoleUpdateDtoType): Observable<RoleToUserObjIdsMapType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'access', userId]);
        this.isUpdatingSignal.set(true);
        this.roleToUserIdsMapSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .patch<ApiResponseSuccess<RoleToUserObjIdsMapType>>(finalEndpoint, roleMap)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isUpdatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse query data. Server response format mismatch.');
                        return null;
                    }
                    const roleToUserIdsMapParse = RoleToUserObjIdsMap.safeParse(res.data);
                    if (!roleToUserIdsMapParse.success) {
                        this.errorSignal.set('Failed to parse query data. Query data format mismatch.');
                        return null;
                    }
                    this.roleToUserIdsMapSignal.set(roleToUserIdsMapParse.data);
                    return roleToUserIdsMapParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal);
                    return of(null);
                })
            );
    }

    removeUserFromProject(projectId: string, userId: string): Observable<RoleToUserObjIdsMapType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'access', userId]);
        this.isRemovingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .delete<ApiResponseSuccess<RoleToUserObjIdsMapType>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isRemovingSignal.set(false);
                    if (!res.success) {
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                        return null;
                    }
                    const roleToUserIdsMapParse = RoleToUserObjIdsMap.safeParse(res.data);
                    if (!roleToUserIdsMapParse.success) {
                        this.errorSignal.set('Failed to parse query data. Query data format mismatch.');
                        return null;
                    }
                    this.usersSignal.update(arr => [...(arr ?? []).filter(u => u._id !== userId)]);
                    this.roleToUserIdsMapSignal.set(roleToUserIdsMapParse.data);
                    return roleToUserIdsMapParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isRemovingSignal);
                    return of(null);
                })
            );
    }
}
