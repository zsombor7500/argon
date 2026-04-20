import { z } from 'zod';

import { TagsDto } from '#/dto/frontend/tag';
import { ObjectId, ObjectIds } from '#/dto/frontend/oid';
import { DatasetsUnpopulatedMapDto } from '#/dto/frontend/dataset';
import { Name, Description, DateFromString } from '#/dto/general';


export const NestedStringRecordDto = z.record(
    z.string(),
    z.record(z.string(), z.string())
);
export type NestedStringRecordDtoType = z.infer<typeof NestedStringRecordDto>;

export const QueryDto = z.object({
    _id:                            ObjectId,
    name:                           Name,
    description:                    Description.optional(),
    datasetToTagToAttributePathMap: NestedStringRecordDto,
    datasets:                       DatasetsUnpopulatedMapDto,
    tags:                           TagsDto,
    createdAt:                      DateFromString,
    updatedAt:                      DateFromString
});
export type QueryDtoType = z.infer<typeof QueryDto>;

export const QueriesDto = QueryDto.array();
export type QueriesDtoType = z.infer<typeof QueriesDto>;

export const QueryCreationDto = z.object({
    name:                           Name,
    description:                    Description.optional(),
    datasetToTagToAttributePathMap: NestedStringRecordDto,
    datasetObjIds:                  ObjectIds,
    tagObjIds:                      ObjectIds
}).strict();
export type QueryCreationDtoType = z.infer<typeof QueryCreationDto>;

export const QueryUpdateDto = z.object({
    name:                           Name.optional(),
    description:                    Description.optional(),
    datasetToTagToAttributePathMap: NestedStringRecordDto.optional(),
    datasetObjIds:                  ObjectIds.optional(),
    tagObjIds:                      ObjectIds.optional(),
}).strict();
export type QueryUpdateDtoType = z.infer<typeof QueryUpdateDto>;

export const QueryExecutionDto = z.object({
    filter: z.record(
        z.string(),
        z.union([z.string(), z.int(), z.boolean()]))
}).strict();
export type QueryExecutionDtoType = z.infer<typeof QueryExecutionDto>;

export const QueryResultDto = z.map(
    z.string(),
    z.record(z.string(), z.any()).array()
).transform((map) => Object.fromEntries(map));
export type QueryResultDtoType = z.infer<typeof QueryResultDto>;

export const QueryPathParamsDto = z.object({
    projectObjId: ObjectId,
    queryObjId:   ObjectId
});
export type QueryPathParamsDtoType = z.infer<typeof QueryPathParamsDto>;
