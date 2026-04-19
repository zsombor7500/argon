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
import { TagDto, TagsDto } from '#/dto/frontend/tag';
import { getApiEndpoint, getErrorMessage } from '#/utils/frontend';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { TagDtoType, TagUpdateDtoType, TagCreationDtoType } from '#/dto/frontend/tag';


@Injectable({
    providedIn: 'root'
})
export class TagService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);

    private tagsSignal = signal<TagDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly tags = this.tagsSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.tagsSignal.set(null);
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

    createTag(projectId: string, inviteData: TagCreationDtoType): Observable<ApiResponseSuccess<TagDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'tags']);
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<TagDtoType>>(finalEndpoint, inviteData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse tag data. Server response format mismatch.');
                const tagParse = TagDto.safeParse(res.data);
                if (!tagParse.success)
                    this.errorSignal.set('Failed to parse tag data. Tag data format mismatch.');
                else
                    this.tagsSignal.update(arr => [...(arr ?? []), tagParse.data]);
                this.isCreatingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to create new tag.');
                this.isCreatingSignal.set(false);
                console.error(`Failure during tag creation request: ${err}`);
            }
        });
        return response;
    }

    getTags(projectId: string): Observable<ApiResponseSuccess<TagDtoType[]>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'tags']);
        this.isLoadingSignal.set(true);
        this.tagsSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .get<ApiResponseSuccess<TagDtoType[]>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse tags data. Server response format mismatch.');
                const tagsParse = TagsDto.safeParse(res.data);
                if (!tagsParse.success)
                    this.errorSignal.set('Failed to parse tags data. Tags data format mismatch.');
                else
                    this.tagsSignal.set(tagsParse.data);
                this.isLoadingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to retrieve tags.');
                this.isLoadingSignal.set(false);
                console.error(`Failure during tags retrieval request: ${err}`);
            }
        });
        return response;
    }

    updateTag(projectId: string, tagId: string, tagData: TagUpdateDtoType): Observable<ApiResponse<TagDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'tags', tagId]);
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .patch<ApiResponseSuccess<TagDtoType>>(finalEndpoint, tagData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse tag data. Server response format mismatch.');
                const tagParse = TagDto.safeParse(res.data);
                if (!tagParse.success)
                    this.errorSignal.set('Failed to parse tag data. Tag data format mismatch.');
                else
                    this.tagsSignal.update(arr => [...(arr ?? []).filter(t => t._id !== tagId), tagParse.data]);
                this.isUpdatingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to update tag.');
                this.isUpdatingSignal.set(false);
                console.error(`Failure during tag update request: ${err}`);
            }
        });
        return response;
    }

    deleteTag(projectId: string, tagId: string): Observable<ApiResponse<any>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'tags', tagId]);
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
                    this.tagsSignal.update(arr => [...(arr ?? []).filter(t => t._id !== tagId)]);
                this.isDeletingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to delete tag.');
                this.isDeletingSignal.set(false);
                console.error(`Failure during tag deletion request: ${err}`);
            }
        });
        return response;
    }
}
