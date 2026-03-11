import express from 'express';

import {
    DATASET_VIEW_SCOPES,
    DATASET_CREATE_SCOPES,
    DATASET_UPDATE_SCOPES,
    DATASET_DELETE_SCOPES,
    DATASET_INGEST_SCOPES
} from '#/constants/api';
import {
    ingestData,
    getDatasets,
    createDataset,
    updateDataset,
    deleteDataset
} from '#/controllers/dataset';
import { requireScope } from '#/middlewares';


export const datasetRouter = express.Router();

datasetRouter.get('/', requireScope(DATASET_VIEW_SCOPES), getDatasets);
datasetRouter.post('/', requireScope(DATASET_CREATE_SCOPES), createDataset);
datasetRouter.patch('/:datasetId', requireScope(DATASET_UPDATE_SCOPES), updateDataset);
datasetRouter.delete('/:datasetId', requireScope(DATASET_DELETE_SCOPES), deleteDataset);
datasetRouter.post('/:datasetId/upload', requireScope(DATASET_INGEST_SCOPES), ingestData);
