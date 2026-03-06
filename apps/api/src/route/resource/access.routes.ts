import express from 'express';

import {
    getAccesses,
    updateAccess,
    revokeAccess
} from '../../controller/access.controller.js';


export const accessRouter = express.Router();

accessRouter.get('/', getAccesses);
accessRouter.patch('/:userId', updateAccess);
accessRouter.delete('/:userId', revokeAccess);
