import express from 'express';

import {
    createUser,
    getUserProfile,
    updateUser,
    deleteUser
} from '#/controllers/user';
import { authJwt } from '#/middlewares';


export const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.use(authJwt);
userRouter.get('/:userId', getUserProfile);
userRouter.patch('/:userId', updateUser);
userRouter.delete('/:userId', deleteUser);
