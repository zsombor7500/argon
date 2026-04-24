import {
    inject,
    effect,
    Component,
    DestroyRef,
    ViewEncapsulation
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';

import {
    NAME_MIN_LENGTH,
    PASSWORD_PATTERN,
    PASSWORD_MIN_LENGTH
} from '#/constants/dtos';
import { UserService } from '#/services';
import type { UserRegistrationDtoType } from '#/dto/user';


@Component({
    selector: 'app-register',
    imports: [FormsModule, RouterLink],
    templateUrl: './registration.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class RegistrationPageComponent {
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    readonly passwordPattern = PASSWORD_PATTERN;
    readonly passwordMinLength = PASSWORD_MIN_LENGTH;
    readonly usernameMinLength = NAME_MIN_LENGTH;

    userService = inject(UserService);
    formData: UserRegistrationDtoType = {
        username: '',
        email: '',
        password: ''
    };

    constructor() {
        const registrationEffectRef = effect(() => {
            const isRegistrating = this.userService.isRegistrating();
            const error = this.userService.error();
            if (error === null && isRegistrating === false) {
                this.userService.resetFeedbackSignals();
                this.router.navigate(['/login'])
                    .catch(err => console.log(`Couldn't route to /login: ${err}`));
            }
        });
        this.destroyRef.onDestroy(() => registrationEffectRef.destroy());
    }

    onSubmit(form: NgForm): void {
        if (!form.valid)
            return;
        this.userService.register(this.formData);
    }
}
