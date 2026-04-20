import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-user-tag-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './tag-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectTagListComponent {

}
