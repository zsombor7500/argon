import {
    Input,
    Output,
    Component,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import type { ProjectDtoType } from '#/dto/frontend/project';
import { RouterLink } from '@angular/router';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-project-entry]',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './project-entry.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectEntryComponent {
    @Input({ required: true }) project!: ProjectDtoType;
    @Output() deleteEvent = new EventEmitter<string>;

    isDisbanding = false;

    onConfirmDisband() {
        this.deleteEvent.emit(this.project._id);
        this.isDisbanding = false;
    }
}
