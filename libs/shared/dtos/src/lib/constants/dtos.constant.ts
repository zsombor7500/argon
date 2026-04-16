// Users
export const USERNAME_MIN_LENGTH = 8;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN = new RegExp(`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@.#$!%*?&])[A-Za-z\\d@.#$!%*?&]{${PASSWORD_MIN_LENGTH},}$`)
