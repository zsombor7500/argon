import express from 'express';

import {
    createUser,
    getUserProfile,
    updateUser,
    deleteUser
} from '#/controllers/user';


export const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.get('/:userId', getUserProfile);
userRouter.patch('/:userId', updateUser);
userRouter.delete('/:userId', deleteUser);
