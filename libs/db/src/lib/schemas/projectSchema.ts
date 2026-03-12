import mongoose, { Types } from 'mongoose';

import { ProjectScope } from '../dtos/scope.dto.js';
import type { IProject } from '#/db/interfaces';


export const projectSchema = new mongoose.Schema<IProject>({
    name: {
        type: String,
        required: [true, '`name` must be provided'],
        minlength: [1, '`name` must be at least 1 characters long']
    },
    ownerObjId: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, '`ownerObjId` must be provided']
    },
    description: {
        type: String,
        required: false,
        minlength: [1, '`description` must be at least 1 characters long']
    },
    userObjIds: {
        type: [{
            type: Types.ObjectId,
            ref: 'User'
        }],
        required: [true, '`userObjIds` must be provided']
    },
    roleToUserObjIdsMap: {
        type: Map,
        of: [{
            type: Types.ObjectId,
            ref: 'User'
        }],
        required: [true, '`roleToUserObjIdsMap` must be provided']
    },
    roleToScopesMap: {
        type: Map,
        of: [{
            type: String,
            enum: ProjectScope
        }],
        required: [true, '`roleToScopesMap` must be provided']
    },
    queryObjIds: {
        type: [{
            type: Types.ObjectId,
            ref: 'Query'
        }],
        required: false,
        minItems: 0,
        default: []
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
    inviteObjIds: {
        type: [{
            type: Types.ObjectId,
            ref: 'Invite'
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
});
