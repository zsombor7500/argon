import { Types, Document } from 'mongoose';

import type { SchemaPrimitiveType } from '#/dto/schema';


export interface ITag extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    type: SchemaPrimitiveType;
    constraints: Map<string, string>;
    createdAt?: Date;
    updatedAt?: Date;
}
