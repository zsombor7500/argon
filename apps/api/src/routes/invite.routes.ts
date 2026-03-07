import express from 'express';

import {
    getInvites,
    createInvite,
    updateInvite,
    cancelInvite,
    acceptRejectInvite
} from '#/controllers/invite';


export const inviteRouter = express.Router();

inviteRouter.get('/', getInvites);
inviteRouter.post('/', createInvite);
inviteRouter.post('/:inviteId', acceptRejectInvite);
inviteRouter.patch('/:inviteId', updateInvite);
inviteRouter.delete('/:inviteId', cancelInvite);
