import { Types, Document } from 'mongoose';

import type { IDataset } from '#/db/interfaces';


export interface IQuery extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    baseDatasetObjId: Types.ObjectId;
    query: object;
    projections: object;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IQueryDatasetPopulated extends IQuery {
    baseDataset: IDataset;
}
