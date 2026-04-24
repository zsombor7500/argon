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

import { frontendConfig } from '#/configs/frontend';
import { InviteDto, InvitesDto } from '#/dto/frontend/invite';
import { AuthService, ToastService } from '#/services';
import { getApiEndpoint, handleErrorResponse } from '#/utils/frontend';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { InviteDtoType, InviteUpdateDtoType, InviteCreationDtoType } from '#/dto/frontend/invite';


@Injectable({
    providedIn: 'root'
})
export class InviteService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    private invitesSignal = signal<InviteDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private isAcceptingSignal = signal<boolean | null>(null);
    private successSignal = signal<string | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly invites = this.invitesSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly isAccepting = this.isAcceptingSignal.asReadonly();
    readonly success = this.successSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.invitesSignal.set(null);
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
            logoutEffectRef.destroy();
            errorEffectRef.destroy();
        });
    }

    resetFeedbackSignals(): void {
        this.isCreatingSignal.set(null);
        this.isLoadingSignal.set(null);
        this.isUpdatingSignal.set(null);
        this.isDeletingSignal.set(null);
        this.isAcceptingSignal.set(null);
        this.successSignal.set(null);
        this.errorSignal.set(null);
    }

    createInvite(projectId: string, inviteData: InviteCreationDtoType): Observable<InviteDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'invites']);
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<InviteDtoType>>(finalEndpoint, inviteData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isCreatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse invite data. Server response format mismatch.');
                        return null;
                    }
                    const inviteParse = InviteDto.safeParse(res.data);
                    if (!inviteParse.success) {
                        this.errorSignal.set('Failed to parse invite data. Invite data format mismatch.');
                        return null;
                    }
                    this.invitesSignal.update(arr => [...(arr ?? []), inviteParse.data]);
                    this.successSignal.set('Successful invite creation');
                    return inviteParse.data;
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isCreatingSignal)))
            );
    }

    getCurrentUserInvites(): Observable<InviteDtoType[]> {
        return this.getInvites(this.authService.tokenData()!.userObjId);
    }

    getInvites(userId: string): Observable<InviteDtoType[]> {
        const finalEndpoint = getApiEndpoint(['users', userId, 'invites']);
        this.isLoadingSignal.set(true);
        this.invitesSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .get<ApiResponseSuccess<InviteDtoType[]>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isLoadingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse invites data. Server response format mismatch.');
                        return [];
                    }
                    const invitesParse = InvitesDto.safeParse(res.data);
                    if (!invitesParse.success) {
                        this.errorSignal.set('Failed to parse invites data. Invites data format mismatch.');
                        return [];
                    }
                    this.invitesSignal.set(invitesParse.data);
                    return invitesParse.data;
                }),
                catchError((err) => {
                    handleErrorResponse(err, this.errorSignal, this.isLoadingSignal);
                    return [];
                })
            );
    }

    updateInvite(projectId: string, inviteId: string, inviteData: InviteUpdateDtoType): Observable<InviteDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'invites', inviteId]);
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .patch<ApiResponseSuccess<InviteDtoType>>(finalEndpoint, inviteData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isUpdatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse invite data. Server response format mismatch.');
                        return null;
                    }
                    const inviteParse = InviteDto.safeParse(res.data);
                    if (!inviteParse.success) {
                        this.errorSignal.set('Failed to parse invite data. Invite data format mismatch.');
                        return null;
                    }
                    this.invitesSignal.update(arr => [...(arr ?? []).filter(i => i._id !== inviteId), inviteParse.data]);
                    this.successSignal.set('Successful invite update');
                    return inviteParse.data;
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal)))
            );
    }

    cancelInvite(projectId: string, inviteId: string): Observable<any> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'invites', inviteId]);
        this.isDeletingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .delete<ApiResponse<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isDeletingSignal.set(false);
                    if (!res.success) {
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                        return;
                    }
                    this.successSignal.set('Successful invite cancellation');
                    this.invitesSignal.update(arr => [...(arr ?? []).filter(i => i._id !== inviteId)]);
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isDeletingSignal)))
            );
    }

    acceptRejectInvite(projectId: string, inviteId: string, doAccept: boolean): Observable<any> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'invites', inviteId]);
        this.isAcceptingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponse<any>>(finalEndpoint, { accept: doAccept })
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isAcceptingSignal.set(false);
                    if (!res.success) {
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                        return;
                    }
                    this.successSignal.set(`Successful invite ${doAccept ? 'acceptance' : 'rejection'}`);
                    this.invitesSignal.update(arr => [...(arr ?? []).filter(i => i._id !== inviteId)]);
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isAcceptingSignal)))
            );
    }
}
