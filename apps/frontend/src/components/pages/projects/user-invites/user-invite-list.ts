import {
    inject,
    computed,
    Component,
    ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgForm, FormsModule } from '@angular/forms';
import { InviteEntryComponent } from './invite-entry/invite-entry.js';
import { AuthService, InviteService, ProjectService } from '#/services';
import type { InviteCreationDtoType } from '#/dto/frontend/invite';


@Component({
    selector: 'app-user-invite-list',
    standalone: true,
    imports: [CommonModule, FormsModule, InviteEntryComponent],
    templateUrl: './user-invite-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class UserInviteListComponent {
    authService = inject(AuthService);
    inviteService = inject(InviteService);
    projectService = inject(ProjectService);
    formData = {
        name: '',
        projectId: '',
        invitedId: '',
        description: ''
    };

    readonly outgoingInvites = computed(() => this.inviteService.invites()
        ?.filter(i => i.invitant._id === this.authService.tokenData()?.userObjId)
    );

    readonly incomingInvites = computed(() => this.inviteService.invites()
        ?.filter(i => i.invited._id === this.authService.tokenData()?.userObjId)
    );

    constructor() {
        this.inviteService.getCurrentUserInvites();
    }

    onSubmit(form: NgForm): void {
        if (!form.valid)
            return;
        const inviteData: InviteCreationDtoType = {
            name: this.formData.name,
            invitedObjId: this.formData.invitedId,
            description: this.formData.description
        };
        if (inviteData.description === '' || inviteData.description === null)
            inviteData.description = undefined;
        this.inviteService.createInvite(this.formData.projectId, inviteData);
    }

    onAcceptRejectEvent(event: { projectId: string, inviteId: string, accept: boolean}): void {
        this.inviteService.acceptRejectInvite(
            event.projectId,
            event.inviteId,
            event.accept
        );
    }

    onCancelEvent(event: { projectId: string, inviteId: string }): void {
        this.inviteService.cancelInvite(
            event.projectId,
            event.inviteId
        );
    }
}
