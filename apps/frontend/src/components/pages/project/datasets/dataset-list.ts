import {
    inject,
    signal,
    Component,
    ViewEncapsulation
} from '@angular/core';
import {
    FormArray,
    Validators,
    FormBuilder,
    AbstractControl,
    ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import type { WritableSignal } from '@angular/core';
import type { ValidationErrors } from '@angular/forms';

import { TEXT_NO_SPECIAL } from '#/constants/dtos';
import { handleErrorResponse } from '#/utils/frontend';
import { DatasetEntryComponent } from './dataset-entry/dataset-entry';
import { TagService, DatasetService, ProjectService } from '#/services';
import { NameValidators, DescriptionValidators, ObjectIdValidators } from '#/constants/frontend';
import type { DatasetCreationDtoType } from '#/dto/frontend/dataset';
import type { ISchemaObjectNode, ISchemaPrimitiveNode, SchemaPrimitiveType } from '#/dto/frontend/schema';


interface AttributeGroup {
    attributePath: string,
    type: string,
    tags: { tagId: string }[]
}

@Component({
    selector: 'app-project-dataset-list',
    imports: [CommonModule, ReactiveFormsModule, DatasetEntryComponent],
    templateUrl: './dataset-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectDatasetListComponent {
    errorSignal = signal<string | null>(null);

    readonly error = this.errorSignal.asReadonly();

    router = inject(Router);
    tagService = inject(TagService);
    formBuilder = inject(FormBuilder);
    datasetService = inject(DatasetService);
    projectService = inject(ProjectService);

    stepOne = true;
    newSchema: ISchemaObjectNode = {
        bsonType: 'object',
        required: [],
        properties: {}
    };

    createForm = this.formBuilder.group({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        name: this.formBuilder.control('', [Validators.required, ...NameValidators]),
        description: this.formBuilder.control('', [...DescriptionValidators]),
        attributes: this.formBuilder.array([])
    });

    constructor() {
        toObservable(this.projectService.selectedProjectSignal)
            .pipe(
                filter(project => project !== null),
                map(project => {
                    this.tagService.getTags(project._id);
                    this.datasetService.getDatasets(project._id);
                })
            )
            .subscribe();
    }

    get attributes(): FormArray {
        return this.createForm.get('attributes') as FormArray;
    }

    addAttribute(): void {
        const attribute = this.formBuilder.group({
            // eslint-disable-next-line @typescript-eslint/unbound-method
            attributePath: this.formBuilder.control('', [Validators.required, Validators.minLength(1), Validators.pattern(TEXT_NO_SPECIAL)]),
            // eslint-disable-next-line @typescript-eslint/unbound-method
            type: this.formBuilder.control('string', [Validators.required, this.typeValidator]),
            tags: this.formBuilder.array([])
        });
        this.attributes.push(attribute);
    }

    removeAttribute(index: number): void {
        this.attributes.removeAt(index);
    }

    getTags(i: number): FormArray {
        return this.attributes.at(i).get('tags') as FormArray;
    }

    addTag(i: number): void {
        const tag = this.formBuilder.group({
            // eslint-disable-next-line @typescript-eslint/unbound-method
            tagId: ['', [Validators.required, Validators.minLength(1), ...ObjectIdValidators]]
        });
        const tags = this.attributes.at(i).get('tags') as FormArray;
        tags.push(tag);
    }

    removeTag(i: number, j: number): void {
        const tags = this.attributes.at(i).get('tags') as FormArray;
        tags.removeAt(j);
    }

    clearTags(): void {
        this.attributes.controls.forEach(control => {
            const tags = control.get('tags') as FormArray;
            tags.clear();
        });
    }

    onCreate(): void {
        const attributeToTagObjIdMap = this.generateAttributePathToTagObjIdsMap();
        if (attributeToTagObjIdMap === null)
            return;
        const datasetData: DatasetCreationDtoType = {
            name: this.createForm.value.name!,
            jsonSchema: this.newSchema,
            attributePathToTagObjIdsMap: attributeToTagObjIdMap,
            description: (this.createForm.value.description !== null && this.createForm.value.description !== '') ?
                this.createForm.value.description : undefined
        };
        this.datasetService
            .createDataset(
                this.projectService.selectedProject()?._id ?? '',
                datasetData
            ).subscribe({
                next: (_ => {
                    this.stepOne = true;
                    this.attributes.clear();
                    this.createForm.reset();
                })
            });
    }

    onIngestEvent(event: {
        datasetId: string,
        data: unknown,
        errorSignal: WritableSignal<string | null>,
        successSignal: WritableSignal<boolean>
    }): void {
        this.datasetService.ingestDataset(
            this.projectService.selectedProject()?._id ?? '',
            event.datasetId,
            event.data
        ).subscribe({
            next: (_ => event.successSignal.set(true)),
            error: (err => handleErrorResponse(err, event.errorSignal, null))
        });
    }

    onDeleteEvent(datasetId: string): void {
        this.datasetService.deleteDataset(
            this.projectService.selectedProject()?._id ?? '',
            datasetId
        );
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

    generateSchema(): void {
        if (!this.createForm.value.attributes)
            return;
        const properties: Record<string, ISchemaPrimitiveNode> = {}
        for (const attribute of this.createForm.value.attributes) {
            const attributeCast = attribute as { attributePath: string, type: SchemaPrimitiveType };
            if (attributeCast.attributePath in properties) {
                this.errorSignal.set(`Duplicate field declaration '${attributeCast.attributePath}'`);
                this.stepOne = true;
                return;
            }
            properties[attributeCast.attributePath] = {
                bsonType: attributeCast.type
            }
        }
        this.errorSignal.set(null);
        this.newSchema.properties = properties;
    }

    generateAttributePathToTagObjIdsMap(): Record<string, string[]> | null {
        const mapping: Record<string, string[]> = {};
        const attributes = this.createForm.value.attributes as AttributeGroup[];
        for (const attr of attributes)
            mapping[attr.attributePath] = attr.tags.map(tag => tag.tagId);
        return mapping;
    }
}
