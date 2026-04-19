import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'app-project-listing',
    imports: [CommonModule, FormsModule],
    templateUrl: './project-listing.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ProjectListingComponent {

}
