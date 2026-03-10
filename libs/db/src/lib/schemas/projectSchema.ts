import mongoose, { Types } from 'mongoose';

import { createId } from '#/utils/db';
import { ProjectScopeSchema } from '#/dto/scope';
import type { IProject } from '#/db/interfaces';


export const projectSchema = new mongoose.Schema<IProject>({
    projectId: {
        type: String,
        index: true,
        unique: [true, '`projectId` must be unique'],
        default: () => createId()
    },
    projectGrn: {
        type: String,
        index: true,
        unique: [true, '`projectGrn` must be unique'],
        required: [true, '`projectGrn` must be provided'],
        minlength: [1, '`projectGrn` must be at least 1 characters long']
    },
    name: {
        type: String,
        required: [true, '`name` must be provided'],
        minlength: [1, '`name` must be at least 1 characters long']
    },
    ownerObjId: {
        type: Types.ObjectId,
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
        of: [{
            type: Types.ObjectId,
            ref: 'users'
        }],
        required: [true, '`roleToUserObjIdsMap` must be provided']
    },
    roleToScopesMap: {
        type: Map,
        of: [{
            type: ProjectScopeSchema
        }],
        required: false,
        default: {
            'admin': [
                'project:all'
            ],
            'default': []
        }
    },
    queryObjIds: {
        type: [{
            type: Types.ObjectId,
            ref: 'queries'
        }],
        required: false,
        minItems: 0,
        default: []
    },
    datasetObjIds: {
        type: [{
            type: Types.ObjectId,
            ref: 'datasets'
        }],
        required: false,
        minItems: 0,
        default: []
    },
    inviteObjIds: {
        type: [{
            type: Types.ObjectId,
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
});
