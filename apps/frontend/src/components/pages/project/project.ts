import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { UserService } from '#/services';


@Component({
    selector: 'app-project',
    imports: [CommonModule, RouterModule],
    templateUrl: './project.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectPageComponent {
    userService = inject(UserService);
}
