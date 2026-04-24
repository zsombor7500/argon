import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { ProjectUserComponent } from './user-entry/user-entry.js';
import { ProjectInviteEntryComponent } from './project-invite-entry/project-invite-entry.js';
import { AccessService, InviteService, ProjectService } from '#/services';


@Component({
    selector: 'app-project-access-list',
    imports: [CommonModule, FormsModule, ProjectUserComponent, ProjectInviteEntryComponent],
    templateUrl: './access-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectAccessListComponent {
    accessService = inject(AccessService);
    inviteService = inject(InviteService);
    projectService = inject(ProjectService);

    isDeleting = false;

    constructor() {
        this.accessService.getCurrentProjectAccesses().subscribe();
    }

    onRemoveUserEvent(userId: string) {
        this.accessService.removeUserFromProject(
            this.projectService.selectedProject()?._id ?? '',
            userId
        )
    }

    onCancelInviteEvent(inviteId: string): void {
        this.inviteService.cancelInvite(
            this.projectService.selectedProject()?._id ?? '',
            inviteId
        ).subscribe();
    }

    onConfirmDeleteProject(): void {
        this.projectService.deleteProject(
            this.projectService.selectedProject()?._id ?? '',
        ).subscribe();
    }
}
