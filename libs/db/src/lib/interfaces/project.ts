import { Types, Document } from 'mongoose';

import type { IUser } from './index.js';


export interface IProject extends Document {
    name: string;
    ownerObjId: Types.ObjectId;
    description?: string;
    userObjIds: Types.ObjectId[]
    roleToUserObjIdsMap: Map<string, Types.ObjectId[]>;
    roleToScopesMap: Map<string, string[]>; // TODO: Fix ProjectScopeDtoType
    queryObjIds: [Types.ObjectId];
    datasetObjIds: [Types.ObjectId];
    inviteObjIds: [Types.ObjectId];
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}

export interface IProjectUserPopulated extends Omit<IProject, 'userIds'> {
    users: IUser[];
}
