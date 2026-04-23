import {
    Input,
    signal,
    inject,
    Output,
    Component,
    DestroyRef,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';
import {
    FormArray,
    FormGroup,
    Validators,
    FormControl,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';

import { handleErrorResponse } from '#/utils/frontend';
import { SchemaTypeValidator } from '#/dto/frontend/schema';
import { QueryService, DatasetService, ProjectService } from '#/services';
import type { SchemaPrimitiveType } from '#/dto/frontend/schema';
import type { QueryDtoType, QueryResultDtoType } from '#/dto/frontend/query';


interface Filter {
    id: FormControl<string>
    name: FormControl<string>,
    type: FormControl<string>,
    valueToMatch: FormControl<string>
}

@Component({
    selector: 'app-query-entry',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './query-entry.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class QueryEntryComponent implements OnInit {
    @Input({ required: true }) query!: QueryDtoType;
    @Output() deleteEvent = new EventEmitter<string>;

    private queryResultSignal = signal<QueryResultDtoType | null>(null);
    private isQueryingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);

    readonly queryResult = this.queryResultSignal.asReadonly();
    readonly isQuerying = this.isQueryingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();

    destroyRef = inject(DestroyRef);
    formBuilder = inject(FormBuilder);
    queryService = inject(QueryService);
    datasetService = inject(DatasetService);
    projectService = inject(ProjectService);
    isDeleting = false;

    filterForm = this.formBuilder.group({
        tagFilters: this.formBuilder.array<FormGroup<Filter>>([])
    });

    ngOnInit() {
        for (const tag of this.query.tags) {
            const tagFilter = this.formBuilder.group({
                id: this.formBuilder.control(tag._id),
                name: this.formBuilder.control(tag.name),
                type: this.formBuilder.control(tag.type),
                // eslint-disable-next-line @typescript-eslint/unbound-method
                valueToMatch: this.formBuilder.control('', [Validators.required])
            });
            this.tagFilters.push(tagFilter);
        }
    }

    get tagFilters(): FormArray {
        return this.filterForm.get('tagFilters') as FormArray;
    }

    getDatasetName(datasetId: string): string | null {
        const dataset = this.query.datasets.find(d => d._id === datasetId);
        if (dataset === undefined)
            return null;
        return dataset.name;
    }

    getOrderedFieldNames(datasetId: string): string[] {
        const schema = this.query.datasets.find(d => d._id === datasetId)?.jsonSchema;
        if (schema === undefined)
            return [];
        return Object.keys(schema.properties).sort();
    }

    getOrderedResults(datasetId: string): any[][] {
        const results = this.queryResult();
        if (results === null)
            return [];
        const datasetRecordResults = results[datasetId];
        if (datasetRecordResults === undefined)
            return [];
        const fieldNames = this.getOrderedFieldNames(datasetId);
        const orderedResults: any[][] = [];
        for (const resRecord of datasetRecordResults) {
            const orderedResult = [];
            for (const fieldName of fieldNames) {
                const value: unknown = resRecord[fieldName];
                if (value === undefined) {
                    console.log(`Malformed query results from dataset '${datasetId}':`, results)
                    return [];
                }
                orderedResult.push(value);
            }
            orderedResults.push(orderedResult);
        }
        return orderedResults;
    }

    onExecution() {
        this.isQueryingSignal.set(false);
        this.errorSignal.set(null);
        const filters = this.filterForm.controls.tagFilters.controls;
        const queryFilter: Record<string, string | number | boolean> = {};
        try {
            for (const filter of filters) {
                const validator = SchemaTypeValidator.get((filter.value.type as SchemaPrimitiveType))
                if (validator === undefined) {
                    this.errorSignal.set(`Unknown filter tag field type '${filter.value.type}'`)
                    return;
                }
                let res: unknown;
                if (filter.value.type !== 'string') {
                    const jsonParse: unknown = JSON.parse(filter.value.valueToMatch ?? '');
                    const validatorParse = validator.safeParse(jsonParse);
                    if (!validatorParse.success) {
                        this.errorSignal.set(`Incorrect filter value for field '${filter.value.name}' of type '${filter.value.type}'`)
                        return;
                    }
                    res = validatorParse.data;
                } else
                    res = filter.value.valueToMatch;
                queryFilter[filter.value.id ?? ''] = res as string | number | boolean;
            }
            this.queryService.executeQuery(
                this.projectService.selectedProject()?._id ?? '',
                this.query._id,
                { filter: queryFilter }
            ).subscribe({
                next: (res => {
                    this.isQueryingSignal.set(false);
                    this.queryResultSignal.set(res);
                    console.log('Result: ', res)
                }),
                error: (err => handleErrorResponse(err, this.errorSignal, this.isQueryingSignal))
            });
        } catch {
            this.errorSignal.set('Invalid value to match for. Verify if valid integer(s) and/or boolean(s) were provided. Booleans must be either "true" or "false".');
        }
    }

    onConfirmDelete() {
        this.deleteEvent.emit(this.query._id);
        this.isDeleting = false;
    }
}
