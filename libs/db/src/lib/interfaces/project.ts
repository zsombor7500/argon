import { Types, Document } from 'mongoose';

import type { ProjectScopeDtoType } from '#/dto/scope';


export interface IProject extends Document {
    projectId: string;
    projectGrn: string;
    name: string;
    ownerObjId: Types.ObjectId;
    description?: string;
    roleToUserObjIdsMap?: Map<string, [Types.ObjectId]>;
    roleToScopesMap?: Map<string, [ProjectScopeDtoType]>;
    queryObjIds?: [Types.ObjectId];
    datasetObjIds?: [Types.ObjectId];
    inviteObjIds?: [Types.ObjectId];
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
