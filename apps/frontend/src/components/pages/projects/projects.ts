import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { UserService } from '#/services';


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
