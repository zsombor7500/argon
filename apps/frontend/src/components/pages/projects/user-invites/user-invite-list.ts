import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { inject, computed, Component, ViewEncapsulation } from '@angular/core';

import { AuthService, InviteService, ProjectService } from '#/services';
import { InviteEntryComponent } from './invite-entry/invite-entry.js';


@Component({
    selector: 'app-user-invite-list',
    standalone: true,
    imports: [CommonModule, InviteEntryComponent, RouterLink],
    templateUrl: './user-invite-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class UserInviteListComponent {
    authService = inject(AuthService);
    inviteService = inject(InviteService);
    projectService = inject(ProjectService);

    readonly outgoingInvites = computed(() => this.inviteService
        .invites()
        ?.filter(i => i.invitant._id === this.authService.tokenData()?.userObjId)
    );

    readonly incomingInvites = computed(() => this.inviteService
        .invites()
        ?.filter(i => i.invited._id === this.authService.tokenData()?.userObjId)
    );

    constructor() {
        this.inviteService.getCurrentUserInvites();
    }

    onAcceptRejectEvent(event: { projectId: string, inviteId: string, accept: boolean}) {
        this.inviteService.acceptRejectInvite(
            event.projectId,
            event.inviteId,
            event.accept
        );
    }

    onCancelEvent(event: { projectId: string, inviteId: string }) {
        this.inviteService.cancelInvite(
            event.projectId,
            event.inviteId
        );
    }
}
