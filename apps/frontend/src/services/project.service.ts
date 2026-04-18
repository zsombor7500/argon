import {
    inject,
    effect,
    signal,
    Injectable,
    DestroyRef
} from '@angular/core';
import { timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '#/services';
import { getApiEndpoint } from '#/utils/frontend';
import { frontendConfig } from '#/configs/frontend';
import { ProjectDto, ProjectsDto } from '#/dto/frontend/project';
import type { ApiResponse } from '#/dto/frontend/api';
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
    private errorSignal = signal<string | null>(null);

    readonly projects = this.projectsSignal.asReadonly();
    readonly isCreating = this.isCreatingSignal.asReadonly();
    readonly isLoading = this.isLoadingSignal.asReadonly();
    readonly isUpdating = this.isUpdatingSignal.asReadonly();
    readonly isDeleting = this.isDeletingSignal.asReadonly();
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
        this.errorSignal.set(null);
    }

    createProject(projectData: ProjectCreationDtoType): void {
        if (!this.authService.isAuthenticated())
            return;
        this.isCreatingSignal.set(false);
        this.errorSignal.set(null);
        this.httpClient
            .post<ApiResponse<ProjectDtoType>>(this.endpoint, projectData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (res => {
                    if (!res.data)
                        this.errorSignal.set('Failed to parse project data. Server response format mismatch.');
                    const projectParse = ProjectDto.safeParse(res.data);
                    if (!projectParse.success)
                        this.errorSignal.set('Failed to parse project data. Project data format mismatch.');
                    else
                        this.projectsSignal.update(arr => [...(arr ?? []), projectParse.data]);
                    this.isLoadingSignal.set(false);
                }),
                error: (err) => {
                    this.errorSignal.set('Failed to create new project.');
                    this.isCreatingSignal.set(false);
                    console.error(`Failure during project creation request: ${err}`);
                }
            });
    }

    getProjects(): void {
        if (!this.authService.isAuthenticated())
            return;
        this.isLoadingSignal.set(true);
        this.projectsSignal.set(null);
        this.errorSignal.set(null);
        this.httpClient
            .get<ApiResponse<ProjectDtoType[]>>(this.endpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
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
                error: (err) => {
                    this.errorSignal.set('Failed to retrieve projects.');
                    this.isLoadingSignal.set(false);
                    console.error(`Failure during projects retrieval request: ${err}`);
                }
            });
    }

    updateProject(projectId: string, projectData: ProjectUpdateDtoType): void {
        if (!this.authService.isAuthenticated())
            return;
        const finalEndpoint = `${this.endpoint}/${projectId}`;
        this.isUpdatingSignal.set(true);
        this.errorSignal.set(null);
        this.httpClient
            .patch<ApiResponse<ProjectDtoType>>(finalEndpoint, projectData)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
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
                error: (err) => {
                    this.errorSignal.set('Failed to update project.');
                    this.isUpdatingSignal.set(false);
                    console.error(`Failure during project update request: ${err}`);
                }
            });
    }

    deleteProject(projectId: string): void {
        if (!this.authService.isAuthenticated())
            return;
        const finalEndpoint = `${this.endpoint}/${projectId}`;
        this.isDeletingSignal.set(true);
        this.errorSignal.set(null);
        this.httpClient
            .delete<ApiResponse<any>>(finalEndpoint)
            .pipe(
                timeout(frontendConfig.defaultTimeout),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (res => {
                    if (!res.success)
                        this.errorSignal.set('Failed to parse response. Server response format mismatch.');
                    else
                        this.projectsSignal.update(arr => [...(arr ?? []).filter(p => p._id !== projectId)]);
                    this.isDeletingSignal.set(false);
                }),
                error: (err) => {
                    this.errorSignal.set('Failed to delete project.');
                    this.isDeletingSignal.set(false);
                    console.error(`Failure during project deletion request: ${err}`);
                }
            });
    }
}
