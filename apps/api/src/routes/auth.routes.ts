import express from 'express'

import {
    login,
    logout,
    status,
    refreshTokens
} from '#/controllers/auth';
import { authJwt } from '#/middlewares';


export const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/refresh', refreshTokens);
authRouter.post('/logout', logout);
authRouter.post('/status', authJwt, status);
