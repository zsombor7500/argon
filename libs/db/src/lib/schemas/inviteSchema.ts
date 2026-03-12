import mongoose, { Types } from 'mongoose';

import type { IInvite } from '#/db/interfaces';


export const inviteSchema = new mongoose.Schema<IInvite>({
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
        type: Types.ObjectId,
        ref: 'User',
        required: [true, '`invitantObjId` must be provided']
    },
    invitedObjId: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, '`invitedObjId` must be provided']
    },
    projectObjId: {
        type: Types.ObjectId,
        ref: 'Project',
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
