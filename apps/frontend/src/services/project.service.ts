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
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { frontendConfig } from '#/configs/frontend';
import { ProjectDto, ProjectsDto } from '#/dto/frontend/project';
import { AuthService, ToastService } from '#/services';
import { getApiEndpoint, handleErrorResponse } from '#/utils/frontend';
import type { ApiResponseSuccess } from '#/dto/frontend/api';
import type { ProjectDtoType, ProjectUpdateDtoType, ProjectCreationDtoType } from '#/dto/frontend/project';


@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private endpoint = getApiEndpoint(['projects']);
    private router = inject(Router);
    private httpClient = inject(HttpClient);
    private destroyRef = inject(DestroyRef);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    private projectsSignal = signal<ProjectDtoType[] | null>(null);
    private isCreatingSignal = signal<boolean | null>(null);
    private isLoadingSignal = signal<boolean | null>(null);
    private isUpdatingSignal = signal<boolean | null>(null);
    private isDeletingSignal = signal<boolean | null>(null);
    private isDisbandingSignal = signal<boolean | null>(null);
    private successSignal = signal<string | null>(null);
    private errorSignal = signal<string | null>(null);

    selectedProjectSignal = signal<ProjectDtoType | null>(null);
    readonly selectedProject = this.selectedProjectSignal.asReadonly();
    readonly projects = this.projectsSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
    readonly isDisbanding = this.isDisbandingSignal.asReadonly();
    readonly success = this.successSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    constructor() {
        const logoutEffectRef = effect(() => {
            const isAuthenticated = this.authService.isAuthenticated();
            if (!isAuthenticated)
                this.projectsSignal.set(null);
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
        this.isDisbandingSignal.set(null);
        this.successSignal.set(null);
        this.errorSignal.set(null);
    }

    createProject(projectData: ProjectCreationDtoType): Observable<ProjectDtoType | null> {
        this.isCreatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .post<ApiResponseSuccess<ProjectDtoType>>(this.endpoint, projectData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isCreatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse project data. Server response format mismatch.');
                        return null;
                    }
                    const projectParse = ProjectDto.safeParse(res.data);
                    if (!projectParse.success) {
                        this.errorSignal.set('Failed to parse project data. Project data format mismatch.');
                        return null;
                    }
                    this.projectsSignal.update(arr => [...(arr ?? []), projectParse.data]);
                    this.selectedProjectSignal.set(projectParse.data);
                    this.successSignal.set('Successful project creation');
                    this.router.navigate(['/projects', projectParse.data._id])
                        .catch(err => console.log(`Couldn't navigate to /projects/${res.data._id}: ${err}`));
                    return projectParse.data;
                }),
                catchError((err) => of(handleErrorResponse(err, this.errorSignal, this.isCreatingSignal)))
            );
    }

    getProject(projectId: string): Observable<ProjectDtoType | null> {
        return this.getProjects()
            .pipe(
                map(projects => {
                    if (projects === null)
                        return null;
                    const project = projects.find(p => p._id === projectId);
                    if (!project)
                        return null;
                    this.selectedProjectSignal.set(project);
                    return project;
                })
            )
    }

    getProjects(): Observable<ProjectDtoType[]> {
        this.isLoadingSignal.set(true);
        this.projectsSignal.set(null);
        this.errorSignal.set(null);
        return this.httpClient
            .get<ApiResponseSuccess<ProjectDtoType[]>>(this.endpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isLoadingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse projects data. Server response format mismatch.');
                        return [];
                    }
                    const projectsParse = ProjectsDto.safeParse(res.data);
                    if (!projectsParse.success) {
                        this.errorSignal.set('Failed to parse projects data. Projects data format mismatch.');
                        return [];
                    }
                    this.projectsSignal.set(projectsParse.data);
                    return projectsParse.data;
                }),
                catchError(err => {
                    handleErrorResponse(err, this.errorSignal, this.isLoadingSignal);
                    return [];
                })
            );
    }

    updateProject(projectId: string, projectData: ProjectUpdateDtoType): Observable<ProjectDtoType | null> {
        const finalEndpoint = `${this.endpoint}/${projectId}`;
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .patch<ApiResponseSuccess<ProjectDtoType>>(finalEndpoint, projectData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isUpdatingSignal.set(false);
                    if (!res.data) {
                        this.errorSignal.set('Failed to parse project data. Server response format mismatch.');
                        return null;
                    }
                    const projectParse = ProjectDto.safeParse(res.data);
                    if (!projectParse.success) {
                        this.errorSignal.set('Failed to parse project data. Project data format mismatch.');
                        return null;
                    }
                    this.projectsSignal.update(arr => [...(arr ?? []).filter(p => p._id !== projectId), projectParse.data]);
                    this.successSignal.set('Successful project update');
                    return projectParse.data;
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isUpdatingSignal)))
            );
    }

    deleteProject(projectId: string): Observable<any> {
        const finalEndpoint = `${this.endpoint}/${projectId}`;
        this.isDeletingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .delete<ApiResponseSuccess<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isDeletingSignal.set(false);
                    if (!res.success) {
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                        return;
                    }
                    this.projectsSignal.update(arr => [...(arr ?? []).filter(p => p._id !== projectId)]);
                    this.successSignal.set('Successful project deletion');
                    this.router.navigate(['/projects'])
                        .catch(err => console.log(`Couldn't navigate to /projects: ${err}`));
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isDeletingSignal)))
            );
    }

    disbandProject(projectId: string): Observable<any> {
        const finalEndpoint = `${this.endpoint}/${projectId}/disband`;
        this.isDisbandingSignal.set(true);
        this.errorSignal.set(null);
        return this.httpClient
            .delete<ApiResponseSuccess<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef),
                map(res => {
                    this.isDisbandingSignal.set(false);
                    if (!res.success) {
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                        return;
                    }
                    this.projectsSignal.update(arr => [...(arr ?? []).filter(p => p._id !== projectId)]);
                    this.successSignal.set('Successful project disband');
                }),
                catchError(err => of(handleErrorResponse(err, this.errorSignal, this.isDisbandingSignal)))
            );
    }
}
