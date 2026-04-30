import {
    FormGroup,
    Validators,
    FormControl,
    ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { ProjectService } from '#/services';
import { DescriptionValidators, NameValidators } from '#/constants/frontend';
import type { ProjectCreationDtoType } from '#/dto/frontend/project';


@Component({
    selector: 'app-project-listing',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './new-project.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class NewProjectComponent {
    projectService = inject(ProjectService);

    creationForm = new FormGroup({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        name: new FormControl('', [Validators.required, ...NameValidators]),
        description: new FormControl('', [...DescriptionValidators]),
    });

    onSubmit(): void {
        if (this.creationForm.value.name === undefined || this.creationForm.value.name === null)
            return;
        if (this.creationForm.invalid)
            return;
        const projectData: ProjectCreationDtoType = {
            name: this.creationForm.value.name,
            description: (this.creationForm.value.description !== null && this.creationForm.value.description !== '') ?
                this.creationForm.value.description : undefined,
        }
        this.projectService.createProject(projectData).subscribe();
    }
}
