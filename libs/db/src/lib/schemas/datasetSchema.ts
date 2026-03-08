import crypto from 'crypto';

import mongoose, { Schema } from 'mongoose';

import type { IDataset } from '#/db/interfaces';


export const datasetSchema = new mongoose.Schema<IDataset>({
    datasetId: {
        type: String,
        index: true,
        unique: [true, '`datasetId` must be unique'],
        default: () => crypto.randomUUID()
    },
    datasetGrn: {
        type: String,
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
        type: Schema.Types.Mixed,
        required: [true, '`mongooseSchema` must be provided']
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
