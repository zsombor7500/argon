import mongoose from 'mongoose';

import type { IDataset } from '#/db/interfaces';


export const datasetSchema = new mongoose.Schema<IDataset>({
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
