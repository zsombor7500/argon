import { z } from 'zod';


export const UserLoginDto = z.object({
    email:    z.string(),
    password: z.string()
}).strict();
export type UserLoginDtoType = z.infer<typeof UserLoginDto>;

export const JwtTokenBodyDto = z.object({
    iat:        z.number(),
    expiration: z.number(),
    userObjId:  z.string()
});
export type JwtTokenBodyDtoType = z.infer<typeof JwtTokenBodyDto>;

export const JwtTokenDto = z.object({
    token: z.string(),
});
export type JwtTokenDtoType = z.infer<typeof JwtTokenDto>;
