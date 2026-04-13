import { z } from 'zod';

import { TagsDto } from '#/dto/tag';
import { ObjectId } from '#/dto/oid';
import { SchemaDto } from '#/dto/schema';


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

export const DatasetCreationDto = z.object({
    name:                        z.string(),
    description:                 z.string().optional(),
    jsonSchema:                  SchemaDto,
    attributePathToTagObjIdsMap: z.record(z.string(), ObjectId.array())
}).strict();
export type DatasetCreationDtoType = z.infer<typeof DatasetCreationDto>;

export const DatasetUpdateDto = z.object({
    name:                        z.string().optional(),
    description:                 z.string().optional(),
    attributePathToTagObjIdsMap: z.record(z.string(), ObjectId.array())
}).strict();
export type DatasetUpdateDtoType = z.infer<typeof DatasetUpdateDto>;

export const DatasetBatchUploadDto = z.object({
    data: z.object().array()
}).strict();
export type DatasetUploadDtoType = z.infer<typeof DatasetBatchUploadDto>;

export const DatasetPathParamsDto = z.object({
    projectObjId: ObjectId,
    datasetObjId: ObjectId
});
export type DatasetPathParamsDtoType = z.infer<typeof DatasetPathParamsDto>;
