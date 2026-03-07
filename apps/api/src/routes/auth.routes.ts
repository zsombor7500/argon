import express from 'express'

import {
    login,
    logout,
    refreshToken
} from '../controller/auth.controller.js';


export const authRouter = express.Router();

authRouter.get('/login', login);
authRouter.post('/refresh', refreshToken);
authRouter.get('/logout', logout);
