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
import { InviteDto, InvitesDto } from '#/dto/frontend/invite';
import { getApiEndpoint, getErrorMessage } from '#/utils/frontend';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { InviteDtoType, InviteUpdateDtoType, InviteCreationDtoType } from '#/dto/frontend/invite';


@Injectable({
    providedIn: 'root'
})
export class InviteService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);

    private invitesSignal = signal<InviteDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly invites = this.invitesSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.invitesSignal.set(null);
        });
        this.destroyRef.onDestroy(() => logoutEffectRef.destroy());
    }

    resetFeedbackSignals(): void {
        this.isCreatingSignal.set(null);
        this.isLoadingSignal.set(null);
        this.isUpdatingSignal.set(null);
        this.isDeletingSignal.set(null);
        this.errorSignal.set(null);
    }

    createInvite(projectId: string, inviteData: InviteCreationDtoType): Observable<ApiResponseSuccess<InviteDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'invites']);
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<InviteDtoType>>(finalEndpoint, inviteData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse invite data. Server response format mismatch.');
                const inviteParse = InviteDto.safeParse(res.data);
                if (!inviteParse.success)
                    this.errorSignal.set('Failed to parse invite data. Invite data format mismatch.');
                else
                    this.invitesSignal.update(arr => [...(arr ?? []), inviteParse.data]);
                this.isCreatingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to create new invite.');
                this.isCreatingSignal.set(false);
                console.error(`Failure during invite creation request: ${err}`);
            }
        });
        return response;
    }

    getCurrentUserInvites(): Observable<ApiResponseSuccess<InviteDtoType[]>> {
        return this.getInvites(this.authService.tokenData()!.userObjId.toString());
    }

    getInvites(userId: string): Observable<ApiResponseSuccess<InviteDtoType[]>> {
        const finalEndpoint = getApiEndpoint(['users', userId, 'invites']);
        this.isLoadingSignal.set(true);
        this.invitesSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .get<ApiResponseSuccess<InviteDtoType[]>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse invites data. Server response format mismatch.');
                const invitesParse = InvitesDto.safeParse(res.data);
                if (!invitesParse.success)
                    this.errorSignal.set('Failed to parse invites data. Invites data format mismatch.');
                else
                    this.invitesSignal.set(invitesParse.data);
                this.isLoadingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to retrieve invites.');
                this.isLoadingSignal.set(false);
                console.error(`Failure during invites retrieval request: ${err}`);
            }
        });
        return response;
    }

    updateInvite(projectId: string, inviteId: string, inviteData: InviteUpdateDtoType): Observable<ApiResponse<InviteDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'invites', inviteId]);
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .patch<ApiResponseSuccess<InviteDtoType>>(finalEndpoint, inviteData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse invite data. Server response format mismatch.');
                const inviteParse = InviteDto.safeParse(res.data);
                if (!inviteParse.success)
                    this.errorSignal.set('Failed to parse invite data. Invite data format mismatch.');
                else
                    this.invitesSignal.update(arr => [...(arr ?? []).filter(i => i._id !== inviteId), inviteParse.data]);
                this.isUpdatingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to update invite.');
                this.isUpdatingSignal.set(false);
                console.error(`Failure during invite update request: ${err}`);
            }
        });
        return response;
    }

    cancelInvite(projectId: string, inviteId: string): Observable<ApiResponse<any>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'invites', inviteId]);
        this.isDeletingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .delete<ApiResponse<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.success)
                    this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                else
                    this.invitesSignal.update(arr => [...(arr ?? []).filter(i => i._id !== inviteId)]);
                this.isDeletingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to delete invite.');
                this.isDeletingSignal.set(false);
                console.error(`Failure during invite deletion request: ${err}`);
            }
        });
        return response;
    }

    acceptRejectInvite(projectId: string, inviteId: string, doAccept: boolean): Observable<ApiResponse<any>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'invites', inviteId]);
        this.isDeletingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponse<any>>(finalEndpoint, { accept: doAccept })
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.success)
                    this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                else
                    this.invitesSignal.update(arr => [...(arr ?? []).filter(i => i._id !== inviteId)]);
                this.isDeletingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to delete invite.');
                this.isDeletingSignal.set(false);
                console.error(`Failure during invite deletion request: ${err}`);
            }
        });
        return response;
    }
}
