import { z } from 'zod';

import {
    PASSWORD_PATTERN,
    PASSWORD_MIN_LENGTH,
    USERNAME_MIN_LENGTH
} from '#/constants/dtos';


export const UserProfileDto = z.object({
    userObjId:   z.string(),
    username:    z.string(),
    displayName: z.string(),
    firstName:   z.string().optional(),
    lastName:    z.string().optional(),
    email:       z.string(),
    description: z.string().optional(),
    createdAt:   z.date(),
    updatedAt:   z.date()
});
export type UserProfileDtoType = z.infer<typeof UserProfileDto>;

export const UserRegistrationDto = z.object({
    username: z.string().min(USERNAME_MIN_LENGTH),
    email:    z.email(),
    password: z.string().min(PASSWORD_MIN_LENGTH).regex(PASSWORD_PATTERN)
}).strict();
export type UserRegistrationDtoType = z.infer<typeof UserRegistrationDto>;

export const UserUpdateDto = z.object({
    username:    z.string().optional(),
    displayName: z.string().optional(),
    firstName:   z.string().optional(),
    lastName:    z.string().optional(),
    email:       z.string().optional(),
    description: z.string().optional()
}).strict();
export type UserUpdateDtoType = z.infer<typeof UserUpdateDto>;

export const UserPathParamsDto = z.object({
    userObjId: z.string()
});
export type UserPathParamsDtoType = z.infer<typeof UserPathParamsDto>;
