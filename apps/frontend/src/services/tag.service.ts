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

import { frontendConfig } from '#/configs/frontend';
import { TagDto, TagsDto } from '#/dto/frontend/tag';
import { AuthService, ToastService } from '#/services';
import { getApiEndpoint, handleErrorResponse } from '#/utils/frontend';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { TagDtoType, TagUpdateDtoType, TagCreationDtoType } from '#/dto/frontend/tag';


@Injectable({
    providedIn: 'root'
})
export class TagService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    private tagsSignal = signal<TagDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private successSignal = signal<string | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly tags = this.tagsSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly success = this.successSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly tagTypes = ['string', 'int', 'bool'];

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.tagsSignal.set(null);
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
        this.successSignal.set(null);
        this.errorSignal.set(null);
    }

    createTag(projectId: string, tagData: TagCreationDtoType): Observable<TagDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'tags']);
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<TagDtoType>>(finalEndpoint, tagData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isCreatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse tag data. Server response format mismatch.');
                        return null;
                    }
                    const tagParse = TagDto.safeParse(res.data);
                    if (!tagParse.success) {
                        this.errorSignal.set('Failed to parse tag data. Tag data format mismatch.');
                        return null;
                    }
                    this.tagsSignal.update(arr => [...(arr ?? []), tagParse.data]);
                    this.successSignal.set('Successful tag creation');
                    return tagParse.data;
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isCreatingSignal)))
            );
    }

    getTags(projectId: string): Observable<TagDtoType[]> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'tags']);
        this.isLoadingSignal.set(true);
        this.tagsSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .get<ApiResponseSuccess<TagDtoType[]>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isLoadingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse tags data. Server response format mismatch.');
                        return [];
                    }
                    const tagsParse = TagsDto.safeParse(res.data);
                    if (!tagsParse.success) {
                        this.errorSignal.set('Failed to parse tags data. Tags data format mismatch.');
                        return [];
                    }
                    this.tagsSignal.set(tagsParse.data);
                    return tagsParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isLoadingSignal)
                    return [];
                })
            );
    }

    updateTag(projectId: string, tagId: string, tagData: TagUpdateDtoType): Observable<TagDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'tags', tagId]);
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .patch<ApiResponseSuccess<TagDtoType>>(finalEndpoint, tagData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isUpdatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse tag data. Server response format mismatch.');
                        return null;
                    }
                    const tagParse = TagDto.safeParse(res.data);
                    if (!tagParse.success) {
                        this.errorSignal.set('Failed to parse tag data. Tag data format mismatch.');
                        return null;
                    }
                    this.tagsSignal.update(arr => [...(arr ?? []).filter(t => t._id !== tagId), tagParse.data]);
                    this.successSignal.set('Successful tag update');
                    return tagParse.data;
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal)))
            );
    }

    deleteTag(projectId: string, tagId: string): Observable<any> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'tags', tagId]);
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
                    this.tagsSignal.update(arr => [...(arr ?? []).filter(t => t._id !== tagId)]);
                    this.successSignal.set('Successful tag deletion');
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isDeletingSignal)))
            );
    }
}
