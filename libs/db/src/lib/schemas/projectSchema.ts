import mongoose, { Schema } from 'mongoose';

import type { Project } from '../interfaces/index.js';


export const projectSchema = new mongoose.Schema<Project>({
    projectId: {
        type: Schema.Types.UUID,
        index: true,
        unique: [true, '`projectId` must be unique'],
        required: [true, '`projectId` must be provided']
    },
    projectGrn: {
        type: String,
        required: [true, '`projectGrn` must be provided'],
        minlength: [1, '`projectGrn` must be at least 1 characters long']
    },
    name: {
        type: String,
        required: [true, '`name` must be provided'],
        minlength: [1, '`name` must be at least 1 characters long']
    },
    ownerObjId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, '`ownerObjId` must be provided']
    },
    description: {
        type: String,
        required: false,
        minlength: [1, '`description` must be at least 1 characters long']
    },
    roleToUserObjIdsMap: {
        type: Map,
        of: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        required: false,
        default: {} // TODO: Add default roles + owner
    },
    queryObjIds: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'queries'
        }],
        required: false,
        minItems: 0,
        default: []
    },
    datasetObjIds: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'datasets'
        }],
        required: false,
        minItems: 0,
        default: []
    },
    inviteObjIds: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'invites'
        }],
        required: false,
        minItems: 0,
        default: []
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
