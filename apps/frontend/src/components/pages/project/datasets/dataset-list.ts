import {
    inject,
    signal,
    computed,
    Component,
    DestroyRef,
    ViewEncapsulation
} from '@angular/core';
import {
    FormArray,
    Validators,
    FormControl,
    FormBuilder,
    AbstractControl,
    ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { map, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import type { WritableSignal } from '@angular/core';
import type { ValidationErrors } from '@angular/forms';

import { TEXT_NO_SPECIAL } from '#/constants/dtos';
import { DatasetEntryComponent } from './dataset-entry/dataset-entry';
import { NameValidators, DescriptionValidators } from '#/constants/frontend';
import { TagService, DatasetService, ProjectService } from '#/services';
import type { TagDtoType } from '#/dto/frontend/tag';
import type { DatasetCreationDtoType } from '#/dto/frontend/dataset';
import type { ISchemaObjectNode, ISchemaPrimitiveNode, SchemaPrimitiveType } from '#/dto/frontend/schema';


interface AttributeGroup {
    attributePath: string;
    type: string;
    tags: { tagId: string }[];
}

interface Attribute {
    attributePath: string;
    type: string;
}

@Component({
    selector: 'app-project-dataset-list',
    imports: [CommonModule, ReactiveFormsModule, DatasetEntryComponent],
    templateUrl: './dataset-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectDatasetListComponent {
    private tags: TagDtoType[] = [];

    router = inject(Router);
    tagService = inject(TagService);
    destroyRef = inject(DestroyRef);
    formBuilder = inject(FormBuilder);
    datasetService = inject(DatasetService);
    projectService = inject(ProjectService);

    errorSignal = signal<string | null>(null);
    isLoadingTagsSignal = signal<boolean>(false);
    areAllFieldsUniqueSignal = signal<boolean>(false);

    readonly error = this.errorSignal.asReadonly();
    readonly isLoadingTags = this.isLoadingTagsSignal.asReadonly();
    readonly areAllFieldsUnique = this.areAllFieldsUniqueSignal.asReadonly();

    createForm = new FormGroup({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        name: new FormControl<string>('', [Validators.required, ...NameValidators]),
        description: new FormControl<string>('', [...DescriptionValidators]),
        attributes: new FormArray([])
    });
    attributePathToTagMap = signal<
        Map<Attribute, FormControl<TagDtoType | null>>
    >(new Map());
    attributePathToTagMapEntries = computed(() => {
        return Array.from(this.attributePathToTagMap().entries());
    });
    newSchema: ISchemaObjectNode = {
        bsonType: 'object',
        required: [],
        properties: {}
    };
    stepOne = true;

    constructor() {
        toObservable(this.projectService.selectedProjectSignal)
            .pipe(
                filter(project => project !== null),
                map(project => {
                    this.tagService.getTags(project._id)
                        .subscribe({
                            next: (tags => {
                                this.tags = tags;
                                this.isLoadingTagsSignal.set(false);
                            })
                        });
                })
            ).subscribe();
        this.createForm.valueChanges.subscribe(() => this.checkAttributePathUniqueness());
    }

    get attributes(): FormArray {
        return this.createForm.get('attributes') as FormArray;
    }

    addAttribute(): void {
        const attribute = this.formBuilder.group({
            // eslint-disable-next-line @typescript-eslint/unbound-method
            attributePath: this.formBuilder.control('', [Validators.required, Validators.minLength(1), Validators.pattern(TEXT_NO_SPECIAL)]),
            // eslint-disable-next-line @typescript-eslint/unbound-method
            type: this.formBuilder.control('string', [Validators.required, this.typeValidator, ]),
            tags: this.formBuilder.array([])
        });
        this.attributes.push(attribute);
    }

    removeAttribute(index: number): void {
        this.attributes.removeAt(index);
    }

    getAvailableTagsOfType(type: string): TagDtoType[] {
        const selectedTagIds = new Set(
            [...this.attributePathToTagMap()]
                .filter(([_, val]) => val !== null && val.value !== null && val.value.type === type)
                .map(([_, val]) => val?.value?._id)
        )
        return this.tags.filter(t => t.type === type && !selectedTagIds.has(t._id));
    }

    checkAttributePathUniqueness() {
        if (this.createForm.invalid || !this.createForm.touched)
                return;
        const attributes = this.createForm.value.attributes as AttributeGroup[];
        const attributePaths = attributes.map(attr => attr.attributePath);
        if (attributePaths.length !== new Set(attributePaths).size) {
            this.errorSignal.set(`Schema contains non-unique fields`);
            this.areAllFieldsUniqueSignal.set(false);
            return;
        }
        this.errorSignal.set(null);
        this.areAllFieldsUniqueSignal.set(true);
    }

    prepStepTwo() {
        this.generateSchema();
        const attributes = this.createForm.value.attributes as AttributeGroup[];
        const attributeToTagMap = new Map<Attribute, FormControl<TagDtoType | null>>(
            attributes.map(attr => [
                { attributePath: attr.attributePath, type: attr.type },
                new FormControl<TagDtoType | null>(null)
            ])
        );
        this.attributePathToTagMap.set(attributeToTagMap);
        this.errorSignal.set(null);
        this.stepOne = false;
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
        Array.from(
            this.attributePathToTagMap().entries()
        ).forEach(([attr, tag]) => mapping[attr.attributePath] = tag.value === null ? [] : [tag.value._id])
        return mapping;
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
        successSignal: WritableSignal<boolean>
    }): void {
        this.datasetService.ingestDataset(
            this.projectService.selectedProject()?._id ?? '',
            event.datasetId,
            event.data
        ).subscribe({
            next: (_ => event.successSignal.set(true))
        });
    }

    onDeleteEvent(datasetId: string): void {
        this.datasetService.deleteDataset(
            this.projectService.selectedProject()?._id ?? '',
            datasetId
        ).subscribe();
    }
}
