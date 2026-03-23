import { Types, Document } from 'mongoose';

import type {
    IUser,
    IInvite,
    IDataset,
    IQueryDatasetPopulated
} from '#/db/interfaces';


export interface IProject extends Document {
    _id: Types.ObjectId;
    name: string;
    ownerObjId: Types.ObjectId;
    description?: string | undefined;
    userObjIds: Types.ObjectId[];
    roleToUserObjIdsMap: Map<string, Types.ObjectId[]>;
    roleToScopesMap: Map<string, string[]>; // TODO: Fix ProjectScopeDtoType
    queryObjIds: Types.ObjectId[];
    datasetObjIds: Types.ObjectId[];
    inviteObjIds: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProjectOwnerPopulated extends IProject {
    owner: IUser;
}

export interface IProjectQueryPopulated extends IProject {
    queries: IQueryDatasetPopulated[];
}

export interface IProjectDatasetPopulated extends IProject {
    datasets: IDataset[];
}

export interface IProjectUserAndInvitePopulated extends IProject {
    users: IUser[];
    invites: IInvite[];
}
