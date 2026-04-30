import {
    Input,
    Output,
    Component,
    EventEmitter,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import type { InviteDtoType } from '#/dto/frontend/invite';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-invite-entry]',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './invite-entry.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class InviteEntryComponent {
    @Input({ required: true }) invite!: InviteDtoType;
    @Input({ required: true }) isOutgoing!: boolean;
    @Output() acceptRejectEvent = new EventEmitter<{
        projectId: string,
        inviteId: string,
        accept: boolean
    }>;
    @Output() cancelEvent = new EventEmitter<{
        projectId: string,
        inviteId: string
    }>;

    isCancelling = false;
    isDeciding = false;
    isAccepting = false;

    onPreDecision(accept: boolean) {
        this.isDeciding = true;
        this.isAccepting = accept;
    }

    onConfirmDecision() {
        this.acceptRejectEvent.emit({
            projectId: this.invite.project._id,
            inviteId: this.invite._id,
            accept: this.isAccepting,
        });
    }

    onConfirmCancel() {
        this.cancelEvent.emit({
            projectId: this.invite.project._id,
            inviteId: this.invite._id
        });
        this.isCancelling = false;
    }
}
