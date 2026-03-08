import { Schema, Document } from 'mongoose';


export interface IProject extends Document {
    projectId: string;
    projectGrn: string;
    name: string;
    ownerObjId: Schema.Types.ObjectId;
    description?: string;
    roleToUserObjIdsMap?: Map<string, [Schema.Types.ObjectId]>;
    queryObjIds?: [Schema.Types.ObjectId];
    datasetObjIds?: [Schema.Types.ObjectId];
    inviteObjIds?: [Schema.Types.ObjectId];
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
