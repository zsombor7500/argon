import { Router, RouterLink } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { effect, inject, Component, DestroyRef, ViewEncapsulation } from '@angular/core';

import { UserService } from '#/services';
import { PASSWORD_PATTERN, PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH } from '#/constants/dtos';
import type { UserRegistrationDtoType } from '#/dto/user';


@Component({
    selector: 'app-register',
    imports: [FormsModule, RouterLink],
    templateUrl: './registration.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class RegistrationPage {
    readonly passwordPattern = PASSWORD_PATTERN;
    readonly passwordMinLength = PASSWORD_MIN_LENGTH;
    readonly usernameMinLength = USERNAME_MIN_LENGTH;

    router = inject(Router);
    destroyRef = inject(DestroyRef);
    userService = inject(UserService);
    formData: UserRegistrationDtoType = {
        username: '',
        email: '',
        password: ''
    };

    constructor() {
        const registrationEffectRef = effect(() => {
            const isSuccessful = this.userService.isRegistrationSuccessful();
            const error = this.userService.error();
            if (error === null && isSuccessful) {
                this.userService.resetSuccess();
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
