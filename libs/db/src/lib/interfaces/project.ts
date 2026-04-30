import { Types, Document } from 'mongoose';

import type {
    ITag,
    IUser,
    IQuery,
    IInvite,
    IQueryPopulated,
    IDatasetPopulated
} from '#/db/interfaces';


export interface IProject extends Document {
    _id: Types.ObjectId;
    name: string;
    ownerObjId: Types.ObjectId;
    description?: string | undefined;
    userObjIds: Types.ObjectId[];
    roleToUserObjIdsMap: Map<string, Types.ObjectId[]>;
    roleToScopesMap: Map<string, string[]>; // TODO: Fix ProjectScopeDtoType
    tagObjIds: Types.ObjectId[];
    queryObjIds: Types.ObjectId[];
    datasetObjIds: Types.ObjectId[];
    inviteObjIds: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProjectOwnerPopulated extends IProject {
    owner: IUser;
}

export interface IProjectTagPopulated extends IProject {
    tags: ITag[];
}

export interface IProjectUnpopulatedQueryPopulated extends IProject {
    queries: IQuery[];
}

export interface IProjectQueryPopulated extends IProject {
    queries: IQueryPopulated[];
}

export interface IProjectDatasetPopulated extends IProject {
    datasets: IDatasetPopulated[];
}

export interface IProjectUserAndInvitePopulated extends IProject {
    users: IUser[];
    invites: IInvite[];
}
