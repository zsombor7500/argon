import {
    Input,
    Output,
    Component,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import type { ProjectInviteDtoType } from '#/dto/frontend/invite';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-project-invite-entry]',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './project-invite-entry.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectInviteEntryComponent {
    @Input({ required: true }) invite!: ProjectInviteDtoType;
    @Output() acceptRejectEvent = new EventEmitter<{
        inviteId: string,
        accept: boolean
    }>;
    @Output() cancelEvent = new EventEmitter<string>;

    isCancelling = false;
    isDeciding = false;
    isAccepting = false;

    onPreDecision(accept: boolean) {
        this.isDeciding = true;
        this.isAccepting = accept;
    }

    onConfirmDecision() {
        this.acceptRejectEvent.emit({
            inviteId: this.invite._id,
            accept: this.isAccepting,
        });
    }

    onConfirmCancel() {
        this.cancelEvent.emit(this.invite._id);
        this.isCancelling = false;
    }
}
