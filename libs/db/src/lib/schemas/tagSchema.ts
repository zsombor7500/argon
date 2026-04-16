import mongoose from 'mongoose';

import type { ITag } from '#/db/interfaces';


export const tagSchema = new mongoose.Schema<ITag>({
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
    type: {
        type: String,
        required: false,
        minlength: [1, '`type` must be at least 1 characters long']
    }
},
{
    timestamps: true
});
