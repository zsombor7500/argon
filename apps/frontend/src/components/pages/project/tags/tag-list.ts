import { Router } from '@angular/router';
import { map, filter } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { inject, Component, ViewEncapsulation } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import type { ValidationErrors } from '@angular/forms';

import { TagEntryComponent } from './tag-entry/tag-entry.js';
import { TagService, ProjectService } from '#/services';
import { DescriptionValidators, NameValidators } from '#/constants/frontend';
import type { TagCreationDtoType } from '#/dto/frontend/tag';
import type { SchemaPrimitiveType } from '#/dto/frontend/schema';


@Component({
    selector: 'app-tag-list',
    imports: [CommonModule, ReactiveFormsModule, TagEntryComponent],
    templateUrl: './tag-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectTagListComponent {
    router = inject(Router);
    tagService = inject(TagService);
    formBuilder = inject(FormBuilder);
    projectService = inject(ProjectService);

    createForm = this.formBuilder.group({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        name: this.formBuilder.control('', [Validators.required, ...NameValidators]),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        type: this.formBuilder.control(this.tagService.tagTypes[0], [Validators.required, this.typeValidator]),
        description: this.formBuilder.control('', [...DescriptionValidators])
    })

    constructor() {
        toObservable(this.projectService.selectedProjectSignal)
            .pipe(
                filter(project => project !== null),
                map(project => this.tagService.getTags(project._id))
            )
            .subscribe();
    }

    onCreate(): void {
        if (!this.createForm.valid)
            return;
        const tagData: TagCreationDtoType = {
            name: this.createForm.value.name!,
            type: this.createForm.value.type as SchemaPrimitiveType,
            description: this.createForm.value.description !== null ?
                this.createForm.value.description : undefined
        };
        if (tagData.description === '' || tagData.description === null)
            tagData.description = undefined;
        console.log(tagData)
        this.tagService.createTag(this.projectService.selectedProject()?._id ?? '', tagData);
    }

    typeValidator(control: AbstractControl): ValidationErrors | null {
        if (!('type' in control) || typeof control.type !== 'string')
            return null;
        return this.tagService.tagTypes.includes(control.type) ? null : {
            invalidType: {
                required: this.tagService.tagTypes,
                choosen: control.type
            }
        };
    };

    onDeleteEvent(tagId: string) {
        this.tagService.deleteTag(
            this.projectService.selectedProject()?._id ?? '',
            tagId
        );
    }
}
