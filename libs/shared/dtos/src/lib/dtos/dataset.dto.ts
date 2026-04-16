import { z } from 'zod';

import { TagsDto } from '#/dto/tag';
import { SchemaDto } from '#/dto/schema';
import { ObjectId, ObjectIds, ObjectIdsToString } from '#/dto/oid';


export const DatasetDto = z.object({
    _id:                    ObjectId,
    name:                   z.string(),
    description:            z.string().optional(),
    jsonSchema:             SchemaDto,
    attributePathToTagsMap: z.map(z.string(), TagsDto).transform((map) => Object.fromEntries(map)),
    createdAt:              z.date(),
    updatedAt:              z.date()
});
export type DatasetDtoType = z.infer<typeof DatasetDto>;

export const DatasetsDto = DatasetDto.array();
export type DatasetsDtoType = z.infer<typeof DatasetsDto>;

export const DatasetUnpopulatedMapDto = z.object({
    _id:                         ObjectId,
    name:                        z.string(),
    description:                 z.string().optional(),
    jsonSchema:                  SchemaDto,
    attributePathToTagObjIdsMap: z.map(z.string(), ObjectIdsToString).transform((map) => Object.fromEntries(map)),
    createdAt:                   z.date(),
    updatedAt:                   z.date()
});
export type DatasetUnpopulatedMapDtoType = z.infer<typeof DatasetUnpopulatedMapDto>;

export const DatasetsUnpopulatedMapDto = DatasetUnpopulatedMapDto.array();
export type DatasetsUnpopulatedMapDtoType = z.infer<typeof DatasetsUnpopulatedMapDto>;

export const DatasetCreationDto = z.object({
    name:                        z.string(),
    description:                 z.string().optional(),
    jsonSchema:                  SchemaDto,
    attributePathToTagObjIdsMap: z.record(z.string(), ObjectIds)
}).strict();
export type DatasetCreationDtoType = z.infer<typeof DatasetCreationDto>;

export const DatasetUpdateDto = z.object({
    name:                        z.string().optional(),
    description:                 z.string().optional(),
    attributePathToTagObjIdsMap: z.record(z.string(), ObjectIds) // Optional
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
