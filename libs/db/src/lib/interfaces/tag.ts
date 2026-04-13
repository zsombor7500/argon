import { Types, Document } from 'mongoose';


export type SchemaPrimitiveType = 'string' | 'int' | 'long' | 'decimal' | 'double' | 'bool' | 'date';

export interface ITag extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    type: SchemaPrimitiveType;
    createdAt?: Date;
    updatedAt?: Date;
}
