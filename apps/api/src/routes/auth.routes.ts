import express from 'express'

import {
    login,
    logout,
    refreshToken
} from '#/controllers/auth';


export const authRouter = express.Router();

authRouter.get('/login', login);
authRouter.post('/refresh', refreshToken);
authRouter.get('/logout', logout);
