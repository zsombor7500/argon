import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-user-invite-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './user-invites-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class UserInviteListComponent {

}
