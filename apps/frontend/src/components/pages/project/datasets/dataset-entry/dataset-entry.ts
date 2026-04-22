import {
    Input,
    signal,
    inject,
    effect,
    Output,
    Component,
    DestroyRef,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import type { WritableSignal } from '@angular/core'

import type { DatasetDtoType } from '#/dto/frontend/dataset';


@Component({
    selector: 'app-dataset-entry',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './dataset-entry.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class DatasetEntryComponent {
    @Input({ required: true }) dataset!: DatasetDtoType;
    @Output() deleteEvent = new EventEmitter<string>;
    @Output() ingestEvent = new EventEmitter<{
        datasetId: string,
        data: unknown,
        errorSignal: WritableSignal<string | null>,
        successSignal: WritableSignal<boolean>
    }>;

    private errorSignal = signal<string | null>(null);
    private successSignal = signal<boolean>(false);

    readonly error = this.errorSignal.asReadonly();
    readonly success = this.successSignal.asReadonly();
    destroyRef = inject(DestroyRef);
    formBuilder = inject(FormBuilder);
    isDeleting = false;

    ingestForm = this.formBuilder.group({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        data: this.formBuilder.control('', [Validators.required])
    })

    constructor() {
        const successEffectRef = effect(() => {
            if (!this.success())
                return;
            this.ingestForm.reset();
        });
        this.destroyRef.onDestroy(() => successEffectRef.destroy());
    }

    onIngest() {
        this.successSignal.set(false);
        if (this.ingestForm.value.data === undefined || this.ingestForm.value.data === null)
            return;
        try {
            const parsedJson: unknown = JSON.parse(this.ingestForm.value.data)
            this.ingestEvent.emit({
                datasetId: this.dataset._id,
                data: parsedJson,
                errorSignal: this.errorSignal,
                successSignal: this.successSignal
            });
        } catch {
            this.errorSignal.set('Invalid JSON data');
        }
    }

    onConfirmDelete() {
        this.deleteEvent.emit(this.dataset._id);
        this.isDeleting = false;
    }
}
