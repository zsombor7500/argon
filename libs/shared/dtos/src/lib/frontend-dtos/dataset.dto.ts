import { z } from 'zod';

import { TagsDto } from '#/dto/frontend/tag';
import { SchemaDto } from '#/dto/frontend/schema';
import { ObjectId, ObjectIds } from '#/dto/frontend/oid';
import { Name, Description, DateFromString } from '#/dto/general';


export const DatasetDto = z.object({
    _id:                    ObjectId,
    name:                   Name,
    description:            Description.optional(),
    jsonSchema:             SchemaDto,
    attributePathToTagsMap: z.record(z.string(), TagsDto),
    createdAt:              DateFromString,
    updatedAt:              DateFromString
});
export type DatasetDtoType = z.infer<typeof DatasetDto>;

export const DatasetsDto = DatasetDto.array();
export type DatasetsDtoType = z.infer<typeof DatasetsDto>;

export const DatasetUnpopulatedMapDto = z.object({
    _id:                         ObjectId,
    name:                        Name,
    description:                 Description.optional(),
    jsonSchema:                  SchemaDto,
    attributePathToTagObjIdsMap: z.record(z.string(), ObjectIds),
    createdAt:                   DateFromString,
    updatedAt:                   DateFromString
});
export type DatasetUnpopulatedMapDtoType = z.infer<typeof DatasetUnpopulatedMapDto>;

export const DatasetsUnpopulatedMapDto = DatasetUnpopulatedMapDto.array();
export type DatasetsUnpopulatedMapDtoType = z.infer<typeof DatasetsUnpopulatedMapDto>;

export const DatasetCreationDto = z.object({
    name:                        Name,
    description:                 Description.optional(),
    jsonSchema:                  SchemaDto,
    attributePathToTagObjIdsMap: z.record(z.string(), ObjectIds)
}).strict();
export type DatasetCreationDtoType = z.infer<typeof DatasetCreationDto>;

export const DatasetUpdateDto = z.object({
    name:                        Name.optional(),
    description:                 Description.optional(),
    attributePathToTagObjIdsMap: z.record(z.string(), ObjectIds).optional()
}).strict();
export type DatasetUpdateDtoType = z.infer<typeof DatasetUpdateDto>;

export const DatasetBatchUploadDto = z.object({
    data: z.object().loose().array()
}).strict();
export type DatasetUploadDtoType = z.infer<typeof DatasetBatchUploadDto>;

export const DatasetPathParamsDto = z.object({
    projectObjId: ObjectId,
    datasetObjId: ObjectId
});
export type DatasetPathParamsDtoType = z.infer<typeof DatasetPathParamsDto>;
