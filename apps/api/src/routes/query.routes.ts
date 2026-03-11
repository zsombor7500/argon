import express from 'express';

import {
    QUERY_VIEW_SCOPES,
    QUERY_CREATE_SCOPES,
    QUERY_UPDATE_SCOPES,
    QUERY_DELETE_SCOPES,
    QUERY_EXECUTE_SCOPES
} from '#/constants/api';
import {
    getQueries,
    createQuery,
    updateQuery,
    deleteQuery,
    executeQuery
} from '#/controllers/query';
import { requireScope } from '#/middlewares';


export const queryRouter = express.Router();

queryRouter.get('/', requireScope(QUERY_VIEW_SCOPES), getQueries);
queryRouter.post('/', requireScope(QUERY_CREATE_SCOPES), createQuery);
queryRouter.patch('/:queryId', requireScope(QUERY_UPDATE_SCOPES), updateQuery);
queryRouter.delete('/:queryId', requireScope(QUERY_DELETE_SCOPES), deleteQuery);
queryRouter.get('/:queryId/execute', requireScope(QUERY_EXECUTE_SCOPES), executeQuery);
