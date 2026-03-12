import { Document } from 'mongoose';


export interface IDataset extends Document {
    name: string;
    description?: string;
    collectionRef: string;
    mongooseSchema: object;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
