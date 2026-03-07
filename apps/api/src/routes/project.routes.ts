import express from 'express';

import {
    getProjects,
    createProject,
    updateProject,
    deleteProject
} from '#/controllers/project';
import { accessRouter, datasetRouter, queryRouter } from './index.js';


export const projectRouter = express.Router();

projectRouter.get('/', getProjects)
projectRouter.post('/', createProject)
projectRouter.patch('/:projectId', updateProject)
projectRouter.delete('/:projectId', deleteProject)

projectRouter.use('/:projectId/queries', queryRouter);
projectRouter.use('/:projectId/datasets', datasetRouter);
projectRouter.use('/:projectId/access', accessRouter);
