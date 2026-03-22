import express from 'express';

import {
    ACCESS_READ_SCOPES,
    USER_UPDATE_SCOPES,
    USER_DELETE_SCOPES
} from '#/constants/api';
import {
    removeUser,
    getAccesses,
    updateUserRole
} from '#/controllers/access';
import { requireScope } from '#/middlewares';


export const accessRouter = express.Router({ mergeParams: true });

accessRouter.get('/', requireScope(ACCESS_READ_SCOPES), getAccesses);
accessRouter.patch('/:userObjId', requireScope(USER_UPDATE_SCOPES), updateUserRole);
accessRouter.delete('/:userObjId', requireScope(USER_DELETE_SCOPES), removeUser);
