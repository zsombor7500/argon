import { Types, Document } from 'mongoose';


export interface IDataset extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    collectionRef: string;
    mongooseSchema: object;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
