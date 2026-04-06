import mongoose, { Types } from 'mongoose';

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
    jsonSchema: {
        type: Object,
        required: false,
        default: {}
    },
    attributePathToTagObjIdsMap: {
        type: Map,
        of: [{
            type: Types.ObjectId,
            ref: 'Tag'
        }],
        required: [true, '`tagObjIds` must be provided']
    }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

datasetSchema.virtual('tags', {
    ref: 'Tag',
    localField: 'tagObjIds',
    foreignField: '_id'
});
