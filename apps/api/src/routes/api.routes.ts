import express from 'express';

import { authRouter } from './auth.routes.js';
import { userRouter, inviteRouter, projectRouter } from './resource/index.js';


export const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/invites', inviteRouter);
apiRouter.use('/projects', projectRouter);
