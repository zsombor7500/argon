import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule],
    templateUrl: './app-navbar.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class AppNavbar {

}
