import { RouterLink } from '@angular/router';
import { NgForm, FormsModule } from '@angular/forms';
import { inject, Component, ViewEncapsulation } from '@angular/core';

import { AuthService, UserService } from '#/services';
import type { UserLoginDtoType } from '#/dto/auth';


@Component({
    selector: 'app-login',
    imports: [FormsModule, RouterLink],
    templateUrl: './login.html',
    styles: [],
    encapsulation: ViewEncapsulation.None
})
export class LoginPageComponent {
    authService = inject(AuthService);
    userService = inject(UserService);
    formData: UserLoginDtoType = {
        email: '',
        password: ''
    };

    onSubmit(form: NgForm): void {
        if (!form.valid)
            return;
        this.authService.login(this.formData);
    }
}
