import { Types, Document } from 'mongoose';


export interface IUser extends Document {
    username: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    passwordHash: string;
    description?: string;
    projectObjIds: [Types.ObjectId];
    inviteObjIds: [Types.ObjectId];
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
}
