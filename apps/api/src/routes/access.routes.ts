import express from 'express';

import {
    ACCESS_VIEW_SCOPES,
    USER_UPDATE_SCOPES,
    USER_REMOVE_SCOPES
} from '#/constants/api';
import {
    getAccesses,
    updateUserRole,
    removeUser
} from '#/controllers/access';
import { requireScope } from '#/middlewares';


export const accessRouter = express.Router();

accessRouter.get('/', requireScope(ACCESS_VIEW_SCOPES), getAccesses);
accessRouter.patch('/:userId', requireScope(USER_UPDATE_SCOPES), updateUserRole);
accessRouter.delete('/:userId', requireScope(USER_REMOVE_SCOPES), removeUser);
