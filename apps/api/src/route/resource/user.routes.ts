import express from 'express';

import {
    createUser,
    updateUser,
    deleteUser
} from '../../controller/user.controller.js';


export const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.patch('/:userId', updateUser);
userRouter.delete('/:userId', deleteUser);
