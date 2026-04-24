import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppNavbar, ToastComponent } from '#/components';


@Component({
    imports: [AppNavbar, ToastComponent, RouterModule],
    selector: 'app-root',
    templateUrl: './app.html',
    styles: []
})
export class App {

}
