import mongoose, { Types } from 'mongoose';

import { createId } from '#/utils/db';
import type { IQuery } from '#/db/interfaces';


export const querySchema = new mongoose.Schema<IQuery>({
    queryId: {
        type: String,
        index: true,
        unique: [true, '`queryId` must be unique'],
        default: () => createId()
    },
    queryGrn: {
        type: String,
        index: true,
        unique: [true, '`queryGrn` must be unique'],
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
        type: Types.ObjectId,
        ref: 'Dataset',
        required: [true, '`baseDatasetObjId` must be provided']
    },
    query: {
        type: Object,
        required: [true, '`query` must be provided']
    },
    projections: {
        type: Object,
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
});
