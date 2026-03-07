import express from 'express';

import {
    getQueries,
    createQuery,
    updateQuery,
    deleteQuery,
    executeQuery
} from '#/controllers/query';


export const queryRouter = express.Router();

queryRouter.get('/', getQueries);
queryRouter.post('/', createQuery);
queryRouter.patch('/:queryId', updateQuery);
queryRouter.delete('/:queryId', deleteQuery);
queryRouter.get('/:queryId/execute', executeQuery);
