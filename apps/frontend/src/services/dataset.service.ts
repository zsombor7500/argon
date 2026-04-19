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
import { DatasetDto, DatasetsDto } from '#/dto/frontend/dataset';
import { getApiEndpoint, getErrorMessage } from '#/utils/frontend';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { DatasetDtoType, DatasetUpdateDtoType, DatasetCreationDtoType } from '#/dto/frontend/dataset';


@Injectable({
    providedIn: 'root'
})
export class DatasetService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);

    private datasetsSignal = signal<DatasetDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private isIngestingSignal = signal<boolean | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly datasets = this.datasetsSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly isIngesting = this.isIngestingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.datasetsSignal.set(null);
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

    createDataset(projectId: string, datasetData: DatasetCreationDtoType): Observable<ApiResponseSuccess<DatasetDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets']);
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<DatasetDtoType>>(finalEndpoint, datasetData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse dataset data. Server response format mismatch.');
                const datasetParse = DatasetDto.safeParse(res.data);
                if (!datasetParse.success)
                    this.errorSignal.set('Failed to parse dataset data. Dataset data format mismatch.');
                else
                    this.datasetsSignal.update(arr => [...(arr ?? []), datasetParse.data]);
                this.isCreatingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to create new dataset.');
                this.isCreatingSignal.set(false);
                console.error(`Failure during dataset creation request: ${err}`);
            }
        });
        return response;
    }

    getDatasets(projectId: string): Observable<ApiResponseSuccess<DatasetDtoType[]>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets']);
        this.isLoadingSignal.set(true);
        this.datasetsSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .get<ApiResponseSuccess<DatasetDtoType[]>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse datasets data. Server response format mismatch.');
                const datasetsParse = DatasetsDto.safeParse(res.data);
                if (!datasetsParse.success)
                    this.errorSignal.set('Failed to parse datasets data. Datasets data format mismatch.');
                else
                    this.datasetsSignal.set(datasetsParse.data);
                this.isLoadingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to retrieve datasets.');
                this.isLoadingSignal.set(false);
                console.error(`Failure during datasets retrieval request: ${err}`);
            }
        });
        return response;
    }

    updateDataset(projectId: string, datasetId: string, datasetData: DatasetUpdateDtoType): Observable<ApiResponse<DatasetDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets', datasetId]);
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .patch<ApiResponseSuccess<DatasetDtoType>>(finalEndpoint, datasetData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse dataset data. Server response format mismatch.');
                const datasetParse = DatasetDto.safeParse(res.data);
                if (!datasetParse.success)
                    this.errorSignal.set('Failed to parse dataset data. dataset data format mismatch.');
                else
                    this.datasetsSignal.update(arr => [...(arr ?? []).filter(d => d._id !== datasetId), datasetParse.data]);
                this.isUpdatingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to update dataset.');
                this.isUpdatingSignal.set(false);
                console.error(`Failure during dataset update request: ${err}`);
            }
        });
        return response;
    }

    deleteDataset(projectId: string, datasetId: string): Observable<ApiResponse<any>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets', datasetId]);
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
                    this.datasetsSignal.update(arr => [...(arr ?? []).filter(d => d._id !== datasetId)]);
                this.isDeletingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to delete dataset.');
                this.isDeletingSignal.set(false);
                console.error(`Failure during dataset deletion request: ${err}`);
            }
        });
        return response;
    }

    ingestDataset(projectId: string, datasetId: string, datasetBatch: Record<string, any>[]): Observable<ApiResponseSuccess<any>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'datasets', datasetId, 'upload']);
        this.isIngestingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<any>>(finalEndpoint, { data: datasetBatch })
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.success)
                    this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                this.isIngestingSignal.set(false);
            }),
            error: (err) => {
                const message = getErrorMessage(err);
                if (message !== undefined)
                    this.errorSignal.set(message);
                else
                    this.errorSignal.set('Failed to ingest dataset batch.');
                this.isIngestingSignal.set(false);
                console.error(`Failure during dataset batch ingestion request: ${err}`);
            }
        });
        return response;
    }
}
