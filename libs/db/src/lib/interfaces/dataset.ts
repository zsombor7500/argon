import { Types, Document } from 'mongoose';

import type { ITag } from '#/db/interfaces';
import type { AttributePath } from '#/types/db';


export interface IDataset extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    collectionRef: string;
    jsonSchema: object;
    attributePathToTagObjIdsMap: Map<AttributePath, Types.ObjectId[]>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IDatasetPopulated extends Omit<IDataset, 'attributePathToTagObjIdsMap'> {
    attributePathToTagObjIdsMap: Map<AttributePath, ITag[]>;
}
