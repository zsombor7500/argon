import express from 'express';

import {
    ingestData,
    getDatasets,
    createDataset,
    updateDataset,
    deleteDataset
} from '../../controller/dataset.controller.js';


export const datasetRouter = express.Router();

datasetRouter.get('/', getDatasets);
datasetRouter.post('/', createDataset);
datasetRouter.patch('/:datasetId', updateDataset);
datasetRouter.delete('/:datasetId', deleteDataset);
datasetRouter.post('/:datasetId/upload', ingestData);
