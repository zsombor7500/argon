import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { AuthService } from '#/services';


@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule],
    templateUrl: './app-navbar.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class AppNavbar {
    authService = inject(AuthService)
}
