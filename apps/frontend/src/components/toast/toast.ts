import { NgClass } from '@angular/common';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { ToastService } from '#/services';


@Component({
    selector: 'app-toast',
    imports: [NgClass],
    templateUrl: './toast.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class ToastComponent {
    toastService = inject(ToastService);

    removeToast(id: string) {
        this.toastService.deleteToast(id);
    }
}
