import { Types, Document } from 'mongoose';

import type { ITag, IDataset } from '#/db/interfaces';
import type { ObjectIdStr, AttributePath } from '#/types/db';


export interface IQuery extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | undefined;
    datasetToTagToAttributePathMap: Map<ObjectIdStr, Map<ObjectIdStr, AttributePath>>;
    datasetObjIds: Types.ObjectId[];
    tagObjIds: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IQueryPopulated extends IQuery {
    datasets: IDataset[];
    tags: ITag[];
}
