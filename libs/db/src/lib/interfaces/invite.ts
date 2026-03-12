import { Types, Document } from 'mongoose';

import type { IProject, IUser } from './index.js';


export interface IInvite extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    invitantObjId: Types.ObjectId;
    invitedObjId: Types.ObjectId;
    projectObjId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}

export interface IInviteUserAndProjectPopulated extends Omit<IUser, 'invitantObjId' | 'invitedObjId' | 'projectObjId'> {
    invitant: IUser;
    invited: IUser;
    project: IProject;
}
