import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { ProjectService } from '#/services';
import { ProjectEntryComponent } from './project-entry/project-entry.js';


@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ProjectEntryComponent, RouterLink],
    templateUrl: './project-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectListComponent {
    projectService = inject(ProjectService);

    constructor() {
        this.projectService.getProjects().subscribe();
    }

    onDisbandProject(projectId: string) {
        this.projectService.disbandProject(projectId).subscribe();
    }
}
