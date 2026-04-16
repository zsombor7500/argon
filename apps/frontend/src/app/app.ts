import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppNavbar } from '../components/app-navbar/app-navbar';


@Component({
    imports: [AppNavbar, RouterModule],
    selector: 'app-root',
    templateUrl: './app.html',
    styles: []
})
export class App {

}
