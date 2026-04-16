import { Types, Document } from 'mongoose';

import type { Expiry, TokenHash } from '#/types/db';
import type { IProject, IInviteUserAndProjectPopulated } from '#/db/interfaces';


export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    displayName: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    email: string;
    passwordHash: string;
    description?: string | undefined;
    projectObjIds: Types.ObjectId[];
    inviteObjIds: Types.ObjectId[];
    refreshTokenHashes: Map<TokenHash, Expiry>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUserInvitePopulated extends IUser {
    invites: IInviteUserAndProjectPopulated[];
}

export interface IUserProjectPopulated extends IUser {
    projects: IProject[];
}
