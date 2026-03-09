import { z } from 'zod';

import {
    PASSWORD_PATTERN,
    PASSWORD_MIN_LENGTH,
    USERNAME_MIN_LENGTH
} from '#/constants/dtos';


export const UserRegistrationDto = z.object({
    username: z.string().min(USERNAME_MIN_LENGTH),
    email:    z.email(),
    password: z.string().min(PASSWORD_MIN_LENGTH).regex(PASSWORD_PATTERN)
}).strict();
export type UserRegistration = z.infer<typeof UserRegistrationDto>;

export const UserProfileDto = z.object({
    userId:      z.string(),
    userGrn:     z.string(),
    username:    z.string(),
    displayName: z.string(),
    firstName:   z.string().optional(),
    lastName:    z.string().optional(),
    email:       z.string(),
    description: z.string().optional(),
    createdAt:   z.date(),
    updatedAt:   z.date()
});
export type UserProfile = z.infer<typeof UserProfileDto>;

export const UserPathParamsDto = z.object({
    userId: z.string()
});
export type UserPathParams = z.infer<typeof UserPathParamsDto>;

export const UserUpdateDto = z.object({
    username:    z.string().optional(),
    displayName: z.string().optional(),
    firstName:   z.string().optional(),
    lastName:    z.string().optional(),
    email:       z.string().optional(),
    description: z.string().optional()
}).strict();
export type UserUpdate = z.infer<typeof UserUpdateDto>;
