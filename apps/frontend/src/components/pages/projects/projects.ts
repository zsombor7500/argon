import { CommonModule } from '@angular/common';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { UserService } from '#/services';
import { RouterModule } from '@angular/router';


@Component({
    selector: 'app-projects',
    imports: [CommonModule, RouterModule],
    templateUrl: './projects.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectsPageComponent {
    userService = inject(UserService);
}
