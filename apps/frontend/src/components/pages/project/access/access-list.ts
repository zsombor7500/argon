import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-project-access-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './access-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectAccessListComponent {

}
