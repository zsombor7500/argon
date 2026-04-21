import { AbstractControl, Validators } from '@angular/forms';

import {
    TEXT_NO_SPECIAL,
    NAME_MIN_LENGTH,
    NAME_MAX_LENGTH,
    EMAIL_MIN_LENGTH,
    EMAIL_MAX_LENGTH,
    PASSWORD_PATTERN,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    TEXT_WHITESPACE_NO_SPECIAL,
    DESCRIPTION_MAX_LENGTH
} from '#/constants/dtos';


export const NameValidators = [
    Validators.minLength(NAME_MIN_LENGTH),
    Validators.maxLength(NAME_MAX_LENGTH),
    Validators.pattern(TEXT_WHITESPACE_NO_SPECIAL)
];

export const UsernameValidators = [
    Validators.minLength(NAME_MIN_LENGTH),
    Validators.maxLength(NAME_MAX_LENGTH),
    Validators.pattern(TEXT_NO_SPECIAL)
];

export const EmailValidators = [
    Validators.minLength(EMAIL_MIN_LENGTH),
    Validators.maxLength(EMAIL_MAX_LENGTH),
    (control: AbstractControl) => Validators.email(control)
];

export const PasswordValidators = [
    Validators.minLength(PASSWORD_MIN_LENGTH),
    Validators.maxLength(PASSWORD_MAX_LENGTH),
    Validators.pattern(PASSWORD_PATTERN)
];

export const DescriptionValidators = [
    Validators.maxLength(DESCRIPTION_MAX_LENGTH),
    Validators.pattern(TEXT_WHITESPACE_NO_SPECIAL)
];
