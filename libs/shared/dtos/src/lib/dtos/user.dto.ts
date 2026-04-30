import { z } from 'zod';

import {
    Name,
    Email,
    Username,
    Password,
    Description
} from '#/dto/general';
import { ObjectId } from '#/dto/oid';


export const UserProfileDto = z.object({
    _id:         ObjectId,
    username:    Username,
    displayName: Name,
    firstName:   Name.optional(),
    lastName:    Name.optional(),
    email:       Email,
    description: Description.optional(),
    createdAt:   z.date(),
    updatedAt:   z.date()
});
export type UserProfileDtoType = z.infer<typeof UserProfileDto>;

export const UserRegistrationDto = z.object({
    username: Username,
    email:    Email,
    password: Password
}).strict();
export type UserRegistrationDtoType = z.infer<typeof UserRegistrationDto>;

export const UserUpdateDto = z.object({
    username:    Username.optional(),
    displayName: Name.optional(),
    firstName:   Name.optional(),
    lastName:    Name.optional(),
    description: Description.optional()
}).strict();
export type UserUpdateDtoType = z.infer<typeof UserUpdateDto>;

export const UserPathParamsDto = z.object({
    userObjId: ObjectId
});
export type UserPathParamsDtoType = z.infer<typeof UserPathParamsDto>;
