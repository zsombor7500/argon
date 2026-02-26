import { Schema, Document } from 'mongoose';


export interface IQuery extends Document {
    queryId: Schema.Types.UUID;
    queryGrn: string;
    name: string;
    description?: string;
    baseDatasetObjId: Schema.Types.ObjectId;
    query: Schema.Types.Mixed;
    projections: Schema.Types.Mixed;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
