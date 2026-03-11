import express from 'express'

import {
    login,
    logout,
    refreshToken
} from '#/controllers/auth';


export const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/refresh', refreshToken);
authRouter.post('/logout', logout);
