import { z } from 'zod';

import { ObjectId } from '#/dto/oid';
import { DatasetDto } from '#/dto/dataset';


export const QueryDto = z.object({
    _id:         ObjectId,
    name:        z.string(),
    description: z.string().optional(),
    baseDataset: DatasetDto,
    query:       z.object(),
    projections: z.object(),
    createdAt:   z.date(),
    updatedAt:   z.date()
});
export type QueryDtoType = z.infer<typeof QueryDto>;

export const QueriesDto = z.array(QueryDto);
export type QueriesDtoType = z.infer<typeof QueriesDto>;

export const QueryCreationDto = z.object({
    name:             z.string(),
    description:      z.string().optional(),
    baseDatasetObjId: ObjectId,
    query:            z.object(),
    projections:      z.object()
}).strict();
export type QueryCreationDtoType = z.infer<typeof QueryCreationDto>;

export const QueryUpdateDto = z.object({
    name:        z.string().optional(),
    description: z.string().optional(),
    query:       z.object().optional(),
    projections: z.object().optional()
}).strict();
export type QueryUpdateDtoType = z.infer<typeof QueryUpdateDto>;

export const QueryResultDto = z.object({
    data: z.object().array()
}).strict();
export type QueryResultDtoType = z.infer<typeof QueryResultDto>;

export const QueryPathParamsDto = z.object({
    projectObjId: ObjectId,
    queryObjId:   ObjectId
});
export type QueryPathParamsDtoType = z.infer<typeof QueryPathParamsDto>;
