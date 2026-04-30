import { Types, Document } from 'mongoose';

import type { SchemaPrimitiveType } from '#/types/db';


export interface ITag extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    type: SchemaPrimitiveType;
    createdAt?: Date;
    updatedAt?: Date;
}
