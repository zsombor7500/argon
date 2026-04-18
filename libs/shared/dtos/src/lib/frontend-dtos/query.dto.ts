import { z } from 'zod';

import { TagsDto } from '#/dto/frontend/tag';
import { ObjectId, ObjectIds } from '#/dto/frontend/oid';
import { DatasetsDto, DatasetsUnpopulatedMapDto } from '#/dto/frontend/dataset';


export const NestedStringMapDto = z.map(
    z.string(),
    z.map(z.string(), z.string()).transform(map => Object.fromEntries(map))
);
export type NestedStringMapDtoType = z.infer<typeof NestedStringMapDto>;

export const NestedStringRecordDto = z.record(
    z.string(),
    z.record(z.string(), z.string())
);
export type NestedStringRecordDtoType = z.infer<typeof NestedStringRecordDto>;

export const QueryDto = z.object({
    _id:                            ObjectId,
    name:                           z.string(),
    description:                    z.string().optional(),
    datasetToTagToAttributePathMap: NestedStringMapDto.transform(map => Object.fromEntries(map)),
    datasets:                       DatasetsUnpopulatedMapDto,
    tags:                           TagsDto,
    createdAt:                      z.date(),
    updatedAt:                      z.date()
});
export type QueryDtoType = z.infer<typeof QueryDto>;

export const QueriesDto = z.object({
    queries: z.array(QueryDto),
    availableDatasets: DatasetsDto,
    availableTags: TagsDto
});
export type QueriesDtoType = z.infer<typeof QueriesDto>;

export const QueryCreationDto = z.object({
    name:                           z.string(),
    description:                    z.string().optional(),
    datasetToTagToAttributePathMap: NestedStringRecordDto,
    datasetObjIds:                  ObjectIds,
    tagObjIds:                      ObjectIds
}).strict();
export type QueryCreationDtoType = z.infer<typeof QueryCreationDto>;

export const QueryUpdateDto = z.object({
    name:                           z.string().optional(),
    description:                    z.string().optional(),
    datasetToTagToAttributePathMap: NestedStringRecordDto.optional(),
    datasetObjIds:                  ObjectIds.optional(),
    tagObjIds:                      ObjectIds.optional(),
}).strict();
export type QueryUpdateDtoType = z.infer<typeof QueryUpdateDto>;

export const QueryExecutionDto = z.object({
    filter: z.record(
        z.string(),
        z.union([z.string(), z.int(), z.int64(), z.float64(), z.boolean()]))
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
