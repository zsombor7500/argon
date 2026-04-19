import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-project-listing',
    imports: [CommonModule, FormsModule],
    templateUrl: './new-project.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class NewProjectComponent {

}
