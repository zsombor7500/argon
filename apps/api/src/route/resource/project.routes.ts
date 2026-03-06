import express from 'express';

import { accessRouter, datasetRouter, queryRouter } from './index.js';


export const projectRouter = express.Router();

projectRouter.use('/:projectId/queries', queryRouter);
projectRouter.use('/:projectId/datasets', datasetRouter);
projectRouter.use('/:projectId/access', accessRouter);
