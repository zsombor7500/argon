import { z } from 'zod';

import {
    NAME_MIN_LENGTH,
    NAME_MAX_LENGTH,
    TEXT_NO_SPECIAL,
    EMAIL_MIN_LENGTH,
    EMAIL_MAX_LENGTH,
    PASSWORD_PATTERN,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    DESCRIPTION_MAX_LENGTH,
    TEXT_WHITESPACE_NO_SPECIAL
} from '#/constants/dtos';


export const DateFromString = z.string().transform((dateStr) => new Date(dateStr));

export const Name = z.string()
    .min(NAME_MIN_LENGTH)
    .max(NAME_MAX_LENGTH)
    .regex(TEXT_WHITESPACE_NO_SPECIAL);
export const Username = z.string()
    .min(NAME_MIN_LENGTH)
    .max(NAME_MAX_LENGTH)
    .regex(TEXT_NO_SPECIAL);
export const Email = z.email()
    .min(EMAIL_MIN_LENGTH)
    .max(EMAIL_MAX_LENGTH);
export const Password = z.string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .regex(PASSWORD_PATTERN);
export const Description = z.string()
    .max(DESCRIPTION_MAX_LENGTH);
