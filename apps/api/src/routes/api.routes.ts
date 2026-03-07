import express from 'express';

import { authRouter, userRouter, inviteRouter, projectRouter } from '#/routes';


export const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/invites', inviteRouter);
apiRouter.use('/projects', projectRouter);
