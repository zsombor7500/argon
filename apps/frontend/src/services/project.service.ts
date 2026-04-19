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
import { ProjectDto, ProjectsDto } from '#/dto/frontend/project';
import { getApiEndpoint, handleErrorResponse } from '#/utils/frontend';
import type { ApiResponseSuccess } from '#/dto/frontend/api';
import type { ProjectDtoType, ProjectUpdateDtoType, ProjectCreationDtoType } from '#/dto/frontend/project';


@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private endpoint = getApiEndpoint(['projects']);
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);

    private projectsSignal = signal<ProjectDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private isDisbandingSignal = signal<boolean | null>(null);
    private errorSignal = signal<string | null>(null);

    readonly projects = this.projectsSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly isDisbanding = this.isDisbandingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.projectsSignal.set(null);
        });
        this.destroyRef.onDestroy(() => logoutEffectRef.destroy());
    }

    resetFeedbackSignals(): void {
        this.isCreatingSignal.set(null);
        this.isLoadingSignal.set(null);
        this.isUpdatingSignal.set(null);
        this.isDeletingSignal.set(null);
        this.isDisbandingSignal.set(null);
        this.errorSignal.set(null);
    }

    createProject(projectData: ProjectCreationDtoType): Observable<ApiResponseSuccess<ProjectDtoType>> {
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .post<ApiResponseSuccess<ProjectDtoType>>(this.endpoint, projectData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse project data. Server response format mismatch.');
                const projectParse = ProjectDto.safeParse(res.data);
                if (!projectParse.success)
                    this.errorSignal.set('Failed to parse project data. Project data format mismatch.');
                else
                    this.projectsSignal.update(arr => [...(arr ?? []), projectParse.data]);
                this.isCreatingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isCreatingSignal)
        });
        return response;
    }

    getProjects(): Observable<ApiResponseSuccess<ProjectDtoType[]>> {
        this.isLoadingSignal.set(true);
        this.projectsSignal.set(null);
        this.errorSignal.set(null);
        const response = this.httpClient
            .get<ApiResponseSuccess<ProjectDtoType[]>>(this.endpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse projects data. Server response format mismatch.');
                const projectsParse = ProjectsDto.safeParse(res.data);
                if (!projectsParse.success)
                    this.errorSignal.set('Failed to parse projects data. Projects data format mismatch.');
                else
                    this.projectsSignal.set(projectsParse.data);
                this.isLoadingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isLoadingSignal)
        });
        return response;
    }

    updateProject(projectId: string, projectData: ProjectUpdateDtoType): Observable<ApiResponseSuccess<ProjectDtoType>> {
        const finalEndpoint = `${this.endpoint}/${projectId}`;
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .patch<ApiResponseSuccess<ProjectDtoType>>(finalEndpoint, projectData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.data)
                    this.errorSignal.set('Failed to parse project data. Server response format mismatch.');
                const projectParse = ProjectDto.safeParse(res.data);
                if (!projectParse.success)
                    this.errorSignal.set('Failed to parse project data. Project data format mismatch.');
                else
                    this.projectsSignal.update(arr => [...(arr ?? []).filter(p => p._id !== projectId), projectParse.data]);
                this.isUpdatingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal)
        });
        return response;
    }

    deleteProject(projectId: string): Observable<ApiResponseSuccess<any>> {
        const finalEndpoint = `${this.endpoint}/${projectId}`;
        this.isDeletingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .delete<ApiResponseSuccess<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.success)
                    this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                else
                    this.projectsSignal.update(arr => [...(arr ?? []).filter(p => p._id !== projectId)]);
                this.isDeletingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isDeletingSignal)
        });
        return response;
    }

    disbandProject(projectId: string): Observable<ApiResponseSuccess<any>> {
        const finalEndpoint = `${this.endpoint}/${projectId}/disband`;
        this.isDisbandingSignal.set(true);
        this.errorSignal.set(null);
        const response = this.httpClient
            .delete<ApiResponseSuccess<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            );
        response.subscribe({
            next: (res => {
                if (!res.success)
                    this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                else
                    this.projectsSignal.update(arr => [...(arr ?? []).filter(p => p._id !== projectId)]);
                this.isDisbandingSignal.set(false);
            }),
            error: (err) => handleErrorResponse(err, this.errorSignal, this.isDisbandingSignal)
        });
        return response;
    }
}
