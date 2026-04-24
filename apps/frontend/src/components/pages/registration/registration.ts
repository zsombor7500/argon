import {
    FormGroup,
    Validators,
    FormControl,
    ReactiveFormsModule
} from '@angular/forms';
import {
    inject,
    effect,
    Component,
    DestroyRef,
    ViewEncapsulation
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { UserService } from '#/services';
import { EmailValidators, PasswordValidators, UsernameValidators } from '#/constants/frontend';
import type { UserRegistrationDtoType } from '#/dto/user';


@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './registration.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class RegistrationPageComponent {
    private destroyRef = inject(DestroyRef);

    userService = inject(UserService);

    registrationForm = new FormGroup({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        username: new FormControl('', [Validators.required, ...UsernameValidators]),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        email: new FormControl('', [Validators.required, ...EmailValidators]),
        password: new FormControl('', [...PasswordValidators]),
    });

    constructor() {
        const registrationEffectRef = effect(() => {
            const isRegistrating = this.userService.isRegistrating();
            const error = this.userService.error();
            if (error === null && isRegistrating === false) {
                this.userService.resetFeedbackSignals();
            }
        });
        this.destroyRef.onDestroy(() => registrationEffectRef.destroy());
    }

    onSubmit(): void {
        if (this.registrationForm.value.username === undefined || this.registrationForm.value.username === null)
            return;
        if (this.registrationForm.value.email === undefined || this.registrationForm.value.email === null)
            return;
        if (this.registrationForm.value.password === undefined || this.registrationForm.value.password === null)
            return;
        if (this.registrationForm.invalid)
            return;
        const userCredentials: UserRegistrationDtoType = {
            username: this.registrationForm.value.username,
            email: this.registrationForm.value.email,
            password: this.registrationForm.value.password
        }
        this.userService.register(userCredentials).subscribe();
    }
}
