import {
    FormGroup,
    Validators,
    FormControl,
    ReactiveFormsModule
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { AuthService } from '#/services';
import { EmailValidators } from '#/constants/frontend';
import type { UserLoginDtoType } from '#/dto/auth';


@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class LoginPageComponent {
    authService = inject(AuthService);

    loginForm = new FormGroup({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        email: new FormControl('', [Validators.required, ...EmailValidators]),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        password: new FormControl('', [Validators.required]),
    });

    onSubmit(): void {
        if (this.loginForm.value.email === undefined || this.loginForm.value.email === null)
            return;
        if (this.loginForm.value.password === undefined || this.loginForm.value.password === null)
            return;
        if (this.loginForm.invalid)
            return;
        const userCredentials: UserLoginDtoType = {
            email: this.loginForm.value.email,
            password: this.loginForm.value.password
        }
        this.authService.login(userCredentials).subscribe();
    }
}
