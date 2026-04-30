import { Types, Document } from 'mongoose';

import type { IProject, IUser } from '#/db/interfaces';


export interface IInvite extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    invitantObjId: Types.ObjectId;
    invitedObjId: Types.ObjectId;
    projectObjId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IInviteUserAndProjectPopulated extends IUser {
    invitant: IUser;
    invited: IUser;
    project: IProject;
}
