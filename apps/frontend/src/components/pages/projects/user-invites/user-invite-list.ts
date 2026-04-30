import {
    FormGroup,
    Validators,
    FormControl,
    ReactiveFormsModule
} from '@angular/forms';
import {
    inject,
    computed,
    Component,
    ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { InviteEntryComponent } from './invite-entry/invite-entry.js';
import { AuthService, InviteService, ProjectService } from '#/services';
import { NameValidators, DescriptionValidators, ObjectIdValidators } from '#/constants/frontend';
import type { InviteCreationDtoType } from '#/dto/frontend/invite';


@Component({
    selector: 'app-user-invite-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InviteEntryComponent],
    templateUrl: './user-invite-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class UserInviteListComponent {
    authService = inject(AuthService);
    inviteService = inject(InviteService);
    projectService = inject(ProjectService);

    creationForm = new FormGroup({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        name: new FormControl('', [Validators.required, ...NameValidators]),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        projectId: new FormControl('', [Validators.required, ...ObjectIdValidators]),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        invitedId: new FormControl('', [Validators.required, ...ObjectIdValidators]),
        description: new FormControl('', [...DescriptionValidators]),
    });

    readonly outgoingInvites = computed(() => this.inviteService.invites()
        ?.filter(i => i.invitant._id === this.authService.tokenData()?.userObjId)
    );

    readonly incomingInvites = computed(() => this.inviteService.invites()
        ?.filter(i => i.invited._id === this.authService.tokenData()?.userObjId)
    );

    constructor() {
        this.inviteService.getCurrentUserInvites().subscribe();
    }

    onSubmit(): void {
        if (this.creationForm.value.name === undefined || this.creationForm.value.name === null)
            return;
        if (this.creationForm.value.projectId === undefined || this.creationForm.value.projectId === null)
            return;
        if (this.creationForm.value.invitedId === undefined || this.creationForm.value.invitedId === null)
            return;
        if (this.creationForm.invalid)
            return;
        const inviteData: InviteCreationDtoType = {
            name: this.creationForm.value.name,
            invitedObjId: this.creationForm.value.invitedId,
            description: (this.creationForm.value.description !== null && this.creationForm.value.description !== '') ?
                this.creationForm.value.description : undefined,
        };
        this.inviteService.createInvite(this.creationForm.value.projectId, inviteData).subscribe({
            next: (_ => this.creationForm.reset())
        });
    }

    onAcceptRejectEvent(event: { projectId: string, inviteId: string, accept: boolean}): void {
        this.inviteService.acceptRejectInvite(
            event.projectId,
            event.inviteId,
            event.accept
        ).subscribe();
    }

    onCancelEvent(event: { projectId: string, inviteId: string }): void {
        this.inviteService.cancelInvite(
            event.projectId,
            event.inviteId
        ).subscribe();
    }
}
