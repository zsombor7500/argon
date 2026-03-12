import express from 'express';

import {
    createUser,
    getUserProfile,
    updateUser,
    deleteUser
} from '#/controllers/user';
import { authJwt } from '#/middlewares';
import { getInvites } from '#/controllers/invite';


export const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.use(authJwt);
userRouter.get('/:userObjId', getUserProfile);
userRouter.get('/:userObjId/invites', getInvites);
userRouter.patch('/:userObjId', updateUser);
userRouter.delete('/:userObjId', deleteUser);
