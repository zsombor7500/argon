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
import { DatasetDto, DatasetsDto } from '#/dto/frontend/dataset';
import { AuthService, ToastService } from '#/services';
import { getApiEndpoint, handleErrorResponse } from '#/utils/frontend';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { DatasetDtoType, DatasetUpdateDtoType, DatasetCreationDtoType } from '#/dto/frontend/dataset';


@Injectable({
    providedIn: 'root'
})
export class DatasetService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    private datasetsSignal = signal<DatasetDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private isIngestingSignal = signal<boolean | null>(null);
    private successSignal = signal<string | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly datasets = this.datasetsSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly isIngesting = this.isIngestingSignal.asReadonly();
    readonly success = this.successSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.datasetsSignal.set(null);
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
        this.isIngestingSignal.set(null);
        this.successSignal.set(null);
        this.errorSignal.set(null);
    }

    createDataset(projectId: string, datasetData: DatasetCreationDtoType): Observable<DatasetDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets']);
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<DatasetDtoType>>(finalEndpoint, datasetData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isCreatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse dataset data. Server response format mismatch.');
                        return null;
                    }
                    const datasetParse = DatasetDto.safeParse(res.data);
                    if (!datasetParse.success) {
                        this.errorSignal.set('Failed to parse dataset data. Dataset data format mismatch.');
                        return null;
                    }
                    this.datasetsSignal.update(arr => [...(arr ?? []), datasetParse.data]);
                    this.successSignal.set('Successful dataset creation');
                    return datasetParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isCreatingSignal)
                    return of(null);
                })
            );
    }

    getDatasets(projectId: string): Observable<DatasetDtoType[]> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets']);
        this.isLoadingSignal.set(true);
        this.datasetsSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .get<ApiResponseSuccess<DatasetDtoType[]>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isLoadingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse datasets data. Server response format mismatch.');
                        return [];
                    }
                    const datasetsParse = DatasetsDto.safeParse(res.data);
                    if (!datasetsParse.success) {
                        this.errorSignal.set('Failed to parse datasets data. Datasets data format mismatch.');
                        return [];
                    } else {
                        this.datasetsSignal.set(datasetsParse.data);
                        return datasetsParse.data;
                    }
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isLoadingSignal)
                    return [];
                })
            );
    }

    updateDataset(projectId: string, datasetId: string, datasetData: DatasetUpdateDtoType): Observable<DatasetDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets', datasetId]);
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .patch<ApiResponseSuccess<DatasetDtoType>>(finalEndpoint, datasetData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isUpdatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse dataset data. Server response format mismatch.');
                        return null;
                    }
                    const datasetParse = DatasetDto.safeParse(res.data);
                    if (!datasetParse.success) {
                        this.errorSignal.set('Failed to parse dataset data. Dataset data format mismatch.');
                        return null;
                    }
                    this.datasetsSignal.update(arr => [...(arr ?? []).filter(d => d._id !== datasetId), datasetParse.data]);
                    this.successSignal.set('Successful dataset update');
                    return datasetParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal);
                    return of(null);
                })
            );
    }

    deleteDataset(projectId: string, datasetId: string): Observable<any> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets', datasetId]);
        this.isDeletingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .delete<ApiResponse<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isDeletingSignal.set(false);
                    if (!res.success)
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                    else
                        this.datasetsSignal.update(arr => [...(arr ?? []).filter(d => d._id !== datasetId)]);
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isDeletingSignal)))
            );
    }

    ingestDataset(projectId: string, datasetId: string, datasetBatch: unknown): Observable<any> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets', datasetId, 'upload']);
        this.isIngestingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<any>>(finalEndpoint, { data: datasetBatch })
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isIngestingSignal.set(false);
                    if (!res.success)
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                })
            );
    }
}
