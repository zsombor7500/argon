import express from 'express'
import cookieParser from 'cookie-parser';

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
authRouter.use(cookieParser());
authRouter.post('/status', authJwt, status);
