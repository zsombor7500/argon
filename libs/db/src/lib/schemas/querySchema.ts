import mongoose, { Types } from 'mongoose';

import type { IQuery } from '#/db/interfaces';


export const querySchema = new mongoose.Schema<IQuery>({
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
    }
},
{
    timestamps: true
});
