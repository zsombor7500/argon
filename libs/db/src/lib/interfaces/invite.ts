import { Types, Document } from 'mongoose';


export interface IInvite extends Document {
    name: string;
    description?: string;
    invitantObjId: Types.ObjectId;
    invitedObjId: Types.ObjectId;
    projectObjId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
