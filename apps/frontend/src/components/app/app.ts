import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppNavbar } from '#/components';


@Component({
    imports: [AppNavbar, RouterModule],
    selector: 'app-root',
    templateUrl: './app.html',
    styles: []
})
export class App {

}
