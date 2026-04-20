export const NAME_MIN_LENGTH = 4;
export const NAME_MAX_LENGTH = 30;
export const TEXT_NO_SPECIAL = new RegExp(`^[A-Za-z\\d]+$`)
export const TEXT_WHITESPACE_NO_SPECIAL = new RegExp(`^[A-Za-z\\d ]+$`)
export const EMAIL_MIN_LENGTH = 4;
export const EMAIL_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 30;
export const PASSWORD_PATTERN = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@.#$!%*?&])[A-Za-z\\d@.#$!%*?&]{${PASSWORD_MIN_LENGTH},}$`)
export const DESCRIPTION_MAX_LENGTH = 100;
