import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-project-dataset-list',
    imports: [CommonModule, FormsModule],
    templateUrl: './dataset-list.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectDatasetListComponent {

}
