import express from 'express'

import {
    login,
    logout,
    refreshTokens
} from '#/controllers/auth';


export const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/refresh', refreshTokens);
authRouter.post('/logout', logout);
