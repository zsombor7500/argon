import mongoose, { Types } from 'mongoose';

import { createId } from '#/utils/db';
import type { IUser } from '#/db/interfaces';


export const userSchema = new mongoose.Schema<IUser>({
    userId: {
        type: String,
        index: true,
        unique: [true, '`userId` must be unique'],
        default: () => createId()
    },
    userGrn: {
        type: String,
        index: true,
        unique: [true, '`userGrn` must be unique'],
        required: [true, '`userGrn` must be provided'],
        minlength: [1, '`userGrn` must be at least 1 characters long']
    },
    username: {
        type: String,
        required: [true, '`username` must be provided'],
        minlength: [1, '`username` must be at least 1 characters long']
    },
    displayName: {
        type: String,
        required: [true, '`displayName` must be provided'],
        minlength: [1, '`displayName` must be at least 1 characters long']
    },
    firstName: {
        type: String,
        required: false,
        minlength: [1, '`firstName` must be at least 1 characters long']
    },
    lastName: {
        type: String,
        required: false,
        minlength: [1, '`lastName` must be at least 1 characters long']
    },
    email: {
        type: String,
        index: true,
        unique: [true, '`email` must be unique'],
        required: [true, '`email` must be provided'],
        pattern: '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/'
    },
    passwordHash: {
        type: String,
        required: [true, '`passwordHash` must be provided'],
        minlength: [1, '`passwordHash` must be at least 1 characters long']
    },
    description: {
        type: String,
        required: false,
        minlength: [1, '`description` must be at least 1 characters long']
    },
    projectObjIds: {
        type: [{
            type: Types.ObjectId,
            ref: 'projects'
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
