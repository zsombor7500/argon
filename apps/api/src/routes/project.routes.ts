import express from 'express';

import {
    queryRouter,
    accessRouter,
    inviteRouter,
    datasetRouter
} from './index.js';
import {
    PROJECT_UPDATE_SCOPES,
    PROJECT_DELETE_SCOPES
} from '#/constants/api';
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject
} from '#/controllers/project';
import { authJwt, requireScope } from '#/middlewares';


export const projectRouter = express.Router();

projectRouter.use(authJwt);
projectRouter.get('/', getProjects)
projectRouter.post('/', createProject)
projectRouter.patch('/:projectId', requireScope(PROJECT_UPDATE_SCOPES), updateProject);
projectRouter.delete('/:projectId', requireScope(PROJECT_DELETE_SCOPES), deleteProject);

projectRouter.use('/:projectId/queries', queryRouter);
projectRouter.use('/:projectId/datasets', datasetRouter);
projectRouter.use('/:projectId/invites', inviteRouter);
projectRouter.use('/:projectId/access', accessRouter);
