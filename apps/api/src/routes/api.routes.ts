import morgan from 'morgan';
import express from 'express';

import { winstonHttpLogStream } from '#/utils/api';
import { authRouter, userRouter, projectRouter } from '#/routes';


export const apiRouter = express.Router();

apiRouter.use(express.json());
apiRouter.use(morgan('combined', { stream: winstonHttpLogStream }));
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/projects', projectRouter);
