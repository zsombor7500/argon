import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { ProjectService } from '#/services';
import type { ProjectCreationDtoType } from '#/dto/frontend/project';


@Component({
    selector: 'app-project-listing',
    imports: [CommonModule, FormsModule],
    templateUrl: './new-project.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class NewProjectComponent {
    projectService = inject(ProjectService);
    formData: ProjectCreationDtoType = {
        name: '',
        description: ''
    };

    onSubmit(form: NgForm): void {
        if (!form.valid)
            return;
        if (this.formData.description === '')
            this.formData.description = undefined;
        this.projectService.createProject(this.formData);
    }
}
