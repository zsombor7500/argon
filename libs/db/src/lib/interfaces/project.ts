import { Types, Document } from 'mongoose';

import type { IUser, IQuery, IDataset } from './index.js';


export interface IProject extends Document {
    _id: Types.ObjectId;
    name: string;
    ownerObjId: Types.ObjectId;
    description?: string | undefined;
    userObjIds: Types.ObjectId[]
    roleToUserObjIdsMap: Map<string, Types.ObjectId[]>;
    roleToScopesMap: Map<string, string[]>; // TODO: Fix ProjectScopeDtoType
    queryObjIds: [Types.ObjectId];
    datasetObjIds: [Types.ObjectId];
    inviteObjIds: [Types.ObjectId];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProjectUserPopulated extends Omit<IProject, 'userObjIds'> {
    userObjIds: IUser[];
}

export interface IProjectDatasetPopulated extends Omit<IProject, 'datasetObjIds'> {
    datasetObjIds: IDataset[];
}

export interface IProjectQueryPopulated extends Omit<IProject, 'queryObjIds'> {
    queryObjIds: IQuery[];
}
