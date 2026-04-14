import { z } from 'zod';

import { TagsDto } from '#/dto/tag';
import { DatasetsDto } from '#/dto/dataset';
import { ObjectId, ObjectIds } from '#/dto/oid';


export const QueryDto = z.object({
    _id:           ObjectId,
    name:          z.string(),
    description:   z.string().optional(),
    datasetObjIds: DatasetsDto,
    tagObjIds:     TagsDto,
    createdAt:     z.date(),
    updatedAt:     z.date()
});
export type QueryDtoType = z.infer<typeof QueryDto>;

export const QueriesDto = z.array(QueryDto);
export type QueriesDtoType = z.infer<typeof QueriesDto>;

export const QueryCreationDto = z.object({
    name:          z.string(),
    description:   z.string().optional(),
    datasetObjIds: ObjectIds,
    tagObjIds:     ObjectIds
}).strict();
export type QueryCreationDtoType = z.infer<typeof QueryCreationDto>;

export const QueryUpdateDto = z.object({
    name:          z.string().optional(),
    description:   z.string().optional(),
    datasetObjIds: ObjectIds,
    tagObjIds:     ObjectIds
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
