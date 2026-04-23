import {
    Input,
    Output,
    Component,
    EventEmitter,
    ViewEncapsulation,
    computed,
    inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import type { UserProfileDtoType } from '#/dto/frontend/user';
import { AccessService } from '#/services';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[app-project-user-entry]',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-entry.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectUserComponent {
    @Input({ required: true }) user!: UserProfileDtoType;
    @Output() removeEvent = new EventEmitter<string>;

    accessService = inject(AccessService);

    role = computed(() => {
        const isLoading = this.accessService.isLoading();
        if (isLoading === null || isLoading)
            return 'Loading...'
        const roleToUsersIdsMap = this.accessService.roleToUserIdsMap();
        if (roleToUsersIdsMap === null)
            return '_'
        const roleEntry = Object.entries(roleToUsersIdsMap)
            .find(([_, userIds]) => userIds.includes(this.user._id));
        if (roleEntry === undefined)
            return '-'
        return roleEntry[0];
    });

    isRemoving = false;

    onConfirmRemoveUser() {
        this.removeEvent.emit(this.user._id);
        this.isRemoving = false;
    }
}
