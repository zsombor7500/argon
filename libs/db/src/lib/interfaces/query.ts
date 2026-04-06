import { Types, Document } from 'mongoose';

import type { ITag } from '#/db/interfaces';


export interface IQuery extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    tagObjIds: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IQueryPopulated extends IQuery {
    tags: ITag[];
}
