import express from 'express';

import {
    INVITE_CREATE_SCOPES,
    INVITE_UPDATE_SCOPES,
    INVITE_DELETE_SCOPES
} from '#/constants/api';
import {
    createInvite,
    updateInvite,
    cancelInvite,
    acceptRejectInvite
} from '#/controllers/invite';
import { requireScope } from '#/middlewares';


export const inviteRouter = express.Router({ mergeParams: true });

inviteRouter.post('/', requireScope(INVITE_CREATE_SCOPES), createInvite);
inviteRouter.post('/:inviteObjId', acceptRejectInvite);
inviteRouter.patch('/:inviteObjId', requireScope(INVITE_UPDATE_SCOPES), updateInvite);
inviteRouter.delete('/:inviteObjId', requireScope(INVITE_DELETE_SCOPES), cancelInvite);
