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
import { QueryDto, QueriesDto } from '#/dto/frontend/query';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';
import type { QueryDtoType, QueryUpdateDtoType, QueryCreationDtoType, QueryResultDtoType, QueryExecutionDtoType } from '#/dto/frontend/query';


@Injectable({
    providedIn: 'root'
})
export class QueryService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);

    private queriesSignal = signal<QueryDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private isIngestingSignal = signal<boolean | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly queries = this.queriesSignal.asReadonly();
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
                this.queriesSignal.set(null);
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

    createQuery(projectId: string, queryData: QueryCreationDtoType): Observable<ApiResponseSuccess<QueryDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries']);
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<QueryDtoType>>(finalEndpoint, queryData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse query data. Server response format mismatch.');
                const queryParse = QueryDto.safeParse(res.data);
                if (!queryParse.success)
                    this.errorSignal.set('Failed to parse query data. Query data format mismatch.');
                else
                    this.queriesSignal.update(arr => [...(arr ?? []), queryParse.data]);
                this.isCreatingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isCreatingSignal)
        });
        return response;
    }

    getQueries(projectId: string): Observable<ApiResponseSuccess<QueryDtoType[]>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries']);
        this.isLoadingSignal.set(true);
        this.queriesSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .get<ApiResponseSuccess<QueryDtoType[]>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse queries data. Server response format mismatch.');
                const queriesParse = QueriesDto.safeParse(res.data);
                if (!queriesParse.success)
                    this.errorSignal.set('Failed to parse queries data. Queries data format mismatch.');
                else
                    this.queriesSignal.set(queriesParse.data);
                this.isLoadingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isLoadingSignal)
        });
        return response;
    }

    updateQuery(projectId: string, queryId: string, queryData: QueryUpdateDtoType): Observable<ApiResponse<QueryDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries', queryId]);
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .patch<ApiResponseSuccess<QueryDtoType>>(finalEndpoint, queryData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse query data. Server response format mismatch.');
                const queryParse = QueryDto.safeParse(res.data);
                if (!queryParse.success)
                    this.errorSignal.set('Failed to parse query data. Query data format mismatch.');
                else
                    this.queriesSignal.update(arr => [...(arr ?? []).filter(q => q._id !== queryId), queryParse.data]);
                this.isUpdatingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal)
        });
        return response;
    }

    deleteQuery(projectId: string, queryId: string): Observable<ApiResponse<any>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries', queryId]);
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
                    this.queriesSignal.update(arr => [...(arr ?? []).filter(q => q._id !== queryId)]);
                this.isDeletingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isDeletingSignal)
        });
        return response;
    }

    executeQuery(projectId: string, queryId: string, filter: QueryExecutionDtoType): Observable<ApiResponseSuccess<QueryResultDtoType>> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries', queryId, 'execute']);
        this.isIngestingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<QueryResultDtoType>>(finalEndpoint, filter)
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
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isIngestingSignal)
        });
        return response;
    }
}
