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

import { AuthService, ToastService } from '#/services';
import { getApiEndpoint } from '#/utils/frontend';
import { frontendConfig } from '#/configs/frontend';
import { handleErrorResponse } from '#/utils/frontend';
import { QueryDto, QueriesDto, QueryResultDto } from '#/dto/frontend/query';
import type {
    QueryDtoType,
    QueryResultDtoType,
    QueryUpdateDtoType,
    QueryCreationDtoType,
    QueryExecutionDtoType
} from '#/dto/frontend/query';
import type { ApiResponse, ApiResponseSuccess } from '#/dto/frontend/api';


@Injectable({
    providedIn: 'root'
})
export class QueryService {
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    private queriesSignal = signal<QueryDtoType[] | null>(null);
    private queryResultSignal = signal<QueryResultDtoType | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private isQueryingSignal = signal<boolean | null>(null);
    private successSignal = signal<string | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly queries = this.queriesSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly isQuerying = this.isQueryingSignal.asReadonly();
    readonly success = this.successSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.queriesSignal.set(null);
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
        this.isQueryingSignal.set(null);
        this.successSignal.set(null);
        this.errorSignal.set(null);
    }

    createQuery(projectId: string, queryData: QueryCreationDtoType): Observable<QueryDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries']);
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<QueryDtoType>>(finalEndpoint, queryData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isCreatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse query data. Server response format mismatch.');
                        return null;
                    }
                    const queryParse = QueryDto.safeParse(res.data);
                    if (!queryParse.success) {
                        this.errorSignal.set('Failed to parse query data. Query data format mismatch.');
                        return null;
                    }
                    this.queriesSignal.update(arr => [...(arr ?? []), queryParse.data]);
                    this.successSignal.set('Successful query creation');
                    return queryParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isCreatingSignal)
                    return of(null);
                })
            );
    }

    getQueries(projectId: string): Observable<QueryDtoType[]> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries']);
        this.isLoadingSignal.set(true);
        this.queriesSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .get<ApiResponseSuccess<QueryDtoType[]>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse queries data. Server response format mismatch.');
                        return [];
                    }
                    const queriesParse = QueriesDto.safeParse(res.data);
                    this.isLoadingSignal.set(false);
                    if (!queriesParse.success) {
                        this.errorSignal.set('Failed to parse queries data. Queries data format mismatch.');
                        return [];
                    }
                    this.queriesSignal.set(queriesParse.data);
                    return queriesParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isLoadingSignal);
                    return [];
                })
            );
    }

    updateQuery(projectId: string, queryId: string, queryData: QueryUpdateDtoType): Observable<QueryDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries', queryId]);
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .patch<ApiResponseSuccess<QueryDtoType>>(finalEndpoint, queryData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isUpdatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse query data. Server response format mismatch.');
                        return null;
                    }
                    const queryParse = QueryDto.safeParse(res.data);
                    if (!queryParse.success) {
                        this.errorSignal.set('Failed to parse query data. Query data format mismatch.');
                        return null;
                    }
                    this.queriesSignal.update(arr => [...(arr ?? []).filter(q => q._id !== queryId), queryParse.data]);
                    this.successSignal.set('Successful query update');
                    return queryParse.data;
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal)))
            );
    }

    deleteQuery(projectId: string, queryId: string): Observable<any> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries', queryId]);
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
                    this.queriesSignal.update(arr => [...(arr ?? []).filter(q => q._id !== queryId)]);
                    this.successSignal.set('Successful query deletion');
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isDeletingSignal)))
            );
    }

    executeQuery(projectId: string, queryId: string, filter: QueryExecutionDtoType): Observable<QueryResultDtoType | null> {
        const finalEndpoint = getApiEndpoint(['projects', projectId, 'queries', queryId, 'execute']);
        this.isQueryingSignal.set(true);
        this.queryResultSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<QueryResultDtoType>>(finalEndpoint, filter)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isQueryingSignal.set(false);
                    if (!res.success) {
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                        return null;
                    }
                    const resultParse = QueryResultDto.safeParse(res.data);
                    if (!resultParse.success) {
                        this.errorSignal.set('Failed to parse queries data. Queries data format mismatch.');
                        return null;
                    }
                    this.successSignal.set('Successful query execution');
                    return resultParse.data;
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isQueryingSignal)))
            );
    }
}
