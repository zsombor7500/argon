import express from 'express';

import {
    INVITE_CREATE_SCOPES,
    INVITE_UPDATE_SCOPES,
    INVITE_CANCEL_SCOPES
} from '#/constants/api';
import {
    getInvites,
    createInvite,
    updateInvite,
    cancelInvite,
    acceptRejectInvite
} from '#/controllers/invite';
import { requireScope } from '#/middlewares';


export const inviteRouter = express.Router();

inviteRouter.get('/', getInvites);
inviteRouter.post('/', requireScope(INVITE_CREATE_SCOPES), createInvite);
inviteRouter.post('/:inviteId', acceptRejectInvite);
inviteRouter.patch('/:inviteId', requireScope(INVITE_UPDATE_SCOPES), updateInvite);
inviteRouter.delete('/:inviteId', requireScope(INVITE_CANCEL_SCOPES), cancelInvite);
