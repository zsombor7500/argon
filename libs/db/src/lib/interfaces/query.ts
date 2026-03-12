import { Types, Document } from 'mongoose';


export interface IQuery extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    baseDatasetObjId: Types.ObjectId;
    query: object;
    projections: object;
    createdAt?: Date;
    updatedAt?: Date;
}
