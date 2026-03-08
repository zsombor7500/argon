import { Schema, Document } from 'mongoose';


export interface IUser extends Document {
    userId: string;
    userGrn: string;
    username: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    passwordHash: string;
    description?: string;
    projectObjIds?: [Schema.Types.ObjectId];
    inviteObjIds?: [Schema.Types.ObjectId];
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
