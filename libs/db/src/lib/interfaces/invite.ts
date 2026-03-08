import { Schema, Document } from 'mongoose';


export interface IInvite extends Document {
    inviteId: string;
    inviteGrn: string;
    name: string;
    description?: string;
    invitantObjId: Schema.Types.ObjectId;
    invitedObjId: Schema.Types.ObjectId;
    projectObjId: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
