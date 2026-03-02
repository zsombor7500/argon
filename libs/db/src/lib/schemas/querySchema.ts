import mongoose, { Schema } from 'mongoose';

import type { Query } from '../interfaces/index.js';


export const querySchema = new mongoose.Schema<Query>({
    queryId: {
        type: Schema.Types.UUID,
        index: true,
        unique: [true, '`queryId` must be unique'],
        required: [true, '`queryId` must be provided']
    },
    queryGrn: {
        type: String,
        required: [true, '`queryGrn` must be provided'],
        minlength: [1, '`queryGrn` must be at least 1 characters long']
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
    baseDatasetObjId: {
        type: Schema.Types.ObjectId,
        ref: 'datasets',
        required: [true, '`baseDatasetObjId` must be provided']
    },
    query: {
        type: Schema.Types.Mixed,
        required: [true, '`query` must be provided']
    },
    projections: {
        type: Schema.Types.Mixed,
        required: [true, '`projections` must be provided']
    },
    archivedAt: {
        type: Date,
        required: false,
        default: null
    }
},
{
    timestamps: true
})
