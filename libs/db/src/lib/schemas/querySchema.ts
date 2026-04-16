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
    datasetToTagToAttributePathMap: {
        type: Map,
        of: {
            type: Map,
            of: String
        },
        required: false,
        default: {}
    },
    datasetObjIds: {
        type: [{
            type: Types.ObjectId,
            ref: 'Dataset'
        }],
        required: false,
        minItems: 0,
        default: []
    },
    tagObjIds: {
        type: [{
            type: Types.ObjectId,
            ref: 'Tag'
        }],
        required: false,
        minItems: 0,
        default: []
    }
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true
});

querySchema.virtual('datasets', {
    ref: 'Dataset',
    localField: 'datasetObjIds',
    foreignField: '_id'
});

querySchema.virtual('tags', {
    ref: 'Tag',
    localField: 'tagObjIds',
    foreignField: '_id'
});
