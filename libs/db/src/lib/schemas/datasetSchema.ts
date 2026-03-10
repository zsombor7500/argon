import mongoose from 'mongoose';

import { createId } from '#/utils/db';
import type { IDataset } from '#/db/interfaces';


export const datasetSchema = new mongoose.Schema<IDataset>({
    datasetId: {
        type: String,
        index: true,
        unique: [true, '`datasetId` must be unique'],
        default: () => createId()
    },
    datasetGrn: {
        type: String,
        index: true,
        unique: [true, '`datasetGrn` must be unique'],
        required: [true, '`datasetGrn` must be provided'],
        minlength: [1, '`datasetGrn` must be at least 1 characters long']
    },
    name: {
        type: String,
        required: [true, '`name` must be provided'],
        minlength: [1, '`name` must be at least 1 characters long']
    },
    description: {
        type: String,
        required: false,
        minlength: [1, '`description` must be at least 1 characters long']
    },
    collectionRef: {
        type: String,
        required: [true, '`collectionRef` must be provided']
    },
    mongooseSchema: {
        type: Object,
        required: false,
        default: {}
    },
    archivedAt: {
        type: Date,
        required: false,
        default: null
    }
},
{
    timestamps: true
});
