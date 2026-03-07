import express from 'express';

import {
    createUser,
    updateUser,
    deleteUser
} from '#/controllers/user';


export const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.patch('/:userId', updateUser);
userRouter.delete('/:userId', deleteUser);
