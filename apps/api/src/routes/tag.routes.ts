import express from 'express';

import {
    TAG_READ_SCOPES,
    TAG_CREATE_SCOPES,
    TAG_UPDATE_SCOPES,
    TAG_DELETE_SCOPES
} from '#/constants/api';
import {
    getTags,
    createTag,
    updateTag,
    deleteTag
} from '#/controllers/tag';
import { requireScope } from '#/middlewares';


export const tagRouter = express.Router({ mergeParams: true });

tagRouter.get('/', requireScope(TAG_READ_SCOPES), getTags);
tagRouter.post('/', requireScope(TAG_CREATE_SCOPES), createTag);
tagRouter.patch('/:tagObjId', requireScope(TAG_UPDATE_SCOPES), updateTag);
tagRouter.delete('/:tagObjId', requireScope(TAG_DELETE_SCOPES), deleteTag);
