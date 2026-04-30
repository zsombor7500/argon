import {
    inject,
    signal,
    computed,
    Component
} from '@angular/core';
import {
    Validators,
    FormBuilder,
    FormControl,
    ReactiveFormsModule
} from '@angular/forms';
import { map, filter } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

import {
    TagService,
    QueryService,
    DatasetService,
    ProjectService
} from '#/services';
import { QueryEntryComponent } from './query-entry/query-entry';
import { DescriptionValidators, NameValidators } from '#/constants/frontend';
import type { TagDtoType } from '#/dto/frontend/tag';
import type { DatasetDtoType } from '#/dto/frontend/dataset';
import type { QueryCreationDtoType, QueryDtoType } from '#/dto/frontend/query';


@Component({
  selector: 'app-project-dataset-list',
  standalone: true,
  imports: [ReactiveFormsModule, QueryEntryComponent],
  templateUrl: 'query-list.html',
  styles: []
})
export class ProjectQueryListComponent {
    private tags: TagDtoType[] = [];
    private datasets: DatasetDtoType[] = [];
    private matchingDatasets: DatasetDtoType[] = [];

    tagService = inject(TagService);
    formBuilder = inject(FormBuilder);
    queryService = inject(QueryService);
    datasetService = inject(DatasetService);
    projectService = inject(ProjectService);

    selectedTags = signal<TagDtoType[]>([]);
    selectedDatasets = signal<DatasetDtoType[]>([]);
    queriesSignal = signal<QueryDtoType[]>([]);
    isLoadingTagsSignal = signal<boolean>(false);
    isRecalculatingMatchesSignal = signal<boolean>(false);
    errorSignal = signal<string | null>(null);

    isLoadingTags = this.isLoadingTagsSignal.asReadonly();
    isRefreshingMatches = this.isRecalculatingMatchesSignal.asReadonly();
    error = this.errorSignal.asReadonly();

    createForm = this.formBuilder.group({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        name: this.formBuilder.control('', [Validators.required, ...NameValidators]),
        description: this.formBuilder.control('', [...DescriptionValidators]),
    });
    tagSelectControl = new FormControl<TagDtoType | null>(null);
    datasetSelectControl = new FormControl<DatasetDtoType | null>(null);
    stepOne = true;

    availableTags = computed(() => {
        if (this.isLoadingTags() === true)
            return [];
        const selectedIds = new Set(
            this.selectedTags().map(t => t._id)
        );
        return this.tags.filter(t => !selectedIds.has(t._id));
    });

    availableDatasets = computed(() => {
        if (this.isRefreshingMatches() === true)
            return [];
        const selectedIds = new Set(
            this.selectedDatasets().map(d => d._id)
        );
        return this.matchingDatasets.filter(d => !selectedIds.has(d._id));
    });

    constructor() {
        this.isLoadingTagsSignal.set(true);
        toObservable(this.projectService.selectedProjectSignal)
            .pipe(
                filter(project => project !== null),
                map(project => {
                    this.queryService.getQueries(project._id)
                        .subscribe({
                            next: (queries => this.queriesSignal.set(queries))
                        });
                    this.tagService.getTags(project._id)
                        .subscribe({
                            next: (tags => {
                                this.tags = tags;
                                this.isLoadingTagsSignal.set(false);
                            })
                        });
                    this.datasetService.getDatasets(project._id)
                        .subscribe({
                            next: (datasets => this.datasets = datasets )
                        });
                })
            ).subscribe();
        this.tagSelectControl.valueChanges.subscribe(tag => {
            if (tag) {
                this.addTagToSelected(tag);
                this.tagSelectControl.setValue(null, { emitEvent: false });
            }
        });
        this.datasetSelectControl.valueChanges.subscribe(dataset => {
            if (dataset) {
                this.addDatasetToSelected(dataset);
                this.datasetSelectControl.setValue(null, { emitEvent: false });
            }
        });
    }

    addTagToSelected(tag: TagDtoType): void {
        this.selectedTags.update(tags => [...tags, tag]);
    }

    addDatasetToSelected(dataset: DatasetDtoType): void {
        this.selectedDatasets.update(datasets => [...datasets, dataset]);
    }

    removeTagFromSelected(tag: TagDtoType): void {
        this.selectedTags.update(tags =>
            tags.filter(t => t._id !== tag._id));
    }

    removeDatasetFromSelected(dataset: DatasetDtoType): void {
        this.selectedDatasets.update(datasets =>
            datasets.filter(d => d._id !== dataset._id));
    }

    recalculateMatchingDatasets() {
        this.isRecalculatingMatchesSignal.set(true);
        this.selectedDatasets.set([]);
        this.matchingDatasets = [];
        const tagIds = this.selectedTags().map(t => t._id);
        for (const dataset of this.datasets) {
            const assignedTagIds = Object.values(dataset.attributePathToTagsMap)
                .flatMap(tags => tags.map(t => t._id));
            const assignedTagIdsUnique = new Set(assignedTagIds);
            if (assignedTagIds.length !== assignedTagIdsUnique.size) {
                this.errorSignal.set('Non-deterministic dataset definition');
                return;
            }
            const mismatch = tagIds.find(tagId => !assignedTagIdsUnique.has(tagId));
            if (mismatch !== undefined)
                continue;
            this.matchingDatasets.push(dataset);
        }
        this.isRecalculatingMatchesSignal.set(false);
    }

    onCreate() {
        if (this.createForm.value.name === undefined || this.createForm.value.name === null)
            return;
        const datasetToTagToAttributePathMap: Record<string, Record<string, string>> = {};
        for (const dataset of this.selectedDatasets()) {
            const tagToAttributePathMap: Record<string, string> = {};
            for (const tag of this.selectedTags()) {
                let exists = false;
                for (const [attributePath, assignedTags] of Object.entries(dataset.attributePathToTagsMap)) {
                    if (!assignedTags.find(t => t._id === tag._id))
                        continue;
                    tagToAttributePathMap[tag._id] = attributePath;
                    exists = true;
                    break;
                }
                if (!exists) {
                    console.log('Mismatched dataset found');
                    return;
                }
            }
            datasetToTagToAttributePathMap[dataset._id] = tagToAttributePathMap;
        }
        const queryData: QueryCreationDtoType = {
            name: this.createForm.value.name,
            description: (this.createForm.value.description !== null && this.createForm.value.description !== '') ?
                this.createForm.value.description : undefined,
            tagObjIds: this.selectedTags().map(t => t._id),
            datasetObjIds: this.selectedDatasets().map(d => d._id),
            datasetToTagToAttributePathMap: datasetToTagToAttributePathMap
        };
        this.queryService.createQuery(
            this.projectService.selectedProject()?._id ?? '',
            queryData
        ).subscribe({
            next: (_ => {
                this.stepOne = true;
                this.selectedTags.set([]);
                this.createForm.reset();
            })
        });
    }

    onDeleteEvent(queryId: string) {
        this.queryService.deleteQuery(
            this.projectService.selectedProject()?._id ?? '',
            queryId
        ).subscribe();
    }
}
