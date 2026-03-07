import mongoose, { Schema } from 'mongoose';

import type { User } from '#/db/interfaces';


export const userSchema = new mongoose.Schema<User>({
    userId: {
        type: Schema.Types.UUID,
        index: true,
        unique: [true, '`userId` must be unique'],
        required: [true, '`userId` must be provided']
    },
    userGrn: {
        type: String,
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
        required: false,
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
            type: Schema.Types.ObjectId,
            ref: 'projects'
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
});
