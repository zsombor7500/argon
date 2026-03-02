import mongoose, { Schema } from 'mongoose';

import type { Invite } from '../interfaces/index.js';


export const inviteSchema = new mongoose.Schema<Invite>({
    inviteId: {
        type: Schema.Types.UUID,
        index: true,
        unique: [true, '`inviteId` must be unique'],
        required: [true, '`inviteId` must be provided']
    },
    inviteGrn: {
        type: String,
        required: [true, '`inviteGrn` must be provided'],
        minlength: [1, '`inviteGrn` must be at least 1 characters long']
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
    invitantObjId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, '`invitantObjId` must be provided']
    },
    invitedObjId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, '`invitedObjId` must be provided']
    },
    projectObjId: {
        type: Schema.Types.ObjectId,
        ref: 'projects',
        required: [true, '`projectObjId` must be provided']
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
