import { Types, Document } from 'mongoose';


export interface IQuery extends Document {
    name: string;
    description?: string;
    baseDatasetObjId: Types.ObjectId;
    query: object;
    projections: object;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
