import { Schema, Document } from 'mongoose';


export interface Dataset extends Document {
    datasetId: Schema.Types.UUID;
    datasetGrn: string;
    name: string;
    description?: string;
    collectionRef: string;
    mongooseSchema: Schema.Types.Mixed;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
