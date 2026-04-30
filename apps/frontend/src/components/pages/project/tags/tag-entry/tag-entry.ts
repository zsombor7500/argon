import {
    Input,
    Output,
    Component,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import type { TagDtoType } from '#/dto/frontend/tag';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-tag-entry]',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tag-entry.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class TagEntryComponent {
    @Input({ required: true }) tag!: TagDtoType;
    @Output() deleteEvent = new EventEmitter<string>;

    isDeleting = false;

    onConfirmDelete() {
        this.deleteEvent.emit(this.tag._id);
        this.isDeleting = false;
    }
}
