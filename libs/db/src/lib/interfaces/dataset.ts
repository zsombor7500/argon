import { Types, Document } from 'mongoose';


export interface IDataset extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    collectionRef: string;
    mongooseSchema: object;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
