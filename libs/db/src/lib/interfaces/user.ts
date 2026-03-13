import { Types, Document } from 'mongoose';

import type { IInvite, IProject } from './index.js';


export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    displayName: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email: string;
    passwordHash: string;
    description?: string | undefined;
    projectObjIds: [Types.ObjectId];
    inviteObjIds: [Types.ObjectId];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserInvitePopulated extends Omit<IUser, 'inviteObjIds'> {
    inviteObjIds: IInvite[];
}

export interface IUserProjectPopulated extends Omit<IUser, 'projectObjIds'> {
    projectObjIds: IProject[];
}

