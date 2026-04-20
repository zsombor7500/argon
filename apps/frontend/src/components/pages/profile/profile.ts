import { CommonModule, DatePipe } from '@angular/common';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { UserService } from '#/services';


@Component({
    selector: 'app-profile',
    imports: [CommonModule, DatePipe],
    templateUrl: './profile.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProfilePageComponent {
    userService = inject(UserService);
    isEditing = false;
    isDeleting = false;

    constructor() {
        this.userService.getCurrentUserProfile();
    }

    onConfirmDeleteUser() {
        this.userService.deleteCurrentUser();
    }
}
