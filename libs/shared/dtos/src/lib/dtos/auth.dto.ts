import { z } from 'zod';

import { ObjectId } from '#/dto/oid';


export const UserLoginDto = z.object({
    email:    z.string(),
    password: z.string()
}).strict();
export type UserLoginDtoType = z.infer<typeof UserLoginDto>;

export const TokenBodyDto = z.object({
    iat:       z.number(),
    exp:       z.number(),
    userObjId: ObjectId
});
export type TokenBodyDtoType = z.infer<typeof TokenBodyDto>;

export const TokenRefreshDto = z.object({
    accessToken: z.string(),
    tokenType:   z.string(),
    tokenBody:   TokenBodyDto
}).strict();
export type TokenRefreshDtoType = z.infer<typeof TokenRefreshDto>;

export const RefreshTokenCoookies = z.object({
    refreshToken: z.string()
});
export type RefreshTokenCoookiesType = z.infer<typeof RefreshTokenCoookies>;
