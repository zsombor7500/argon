import { z } from 'zod';

import { ObjectId } from '#/dto/oid';


export const DatasetDto = z.object({
    _id:            ObjectId,
    name:           z.string(),
    description:    z.string().optional(),
    mongooseSchema: z.object(),
    createdAt:      z.date(),
    updatedAt:      z.date()
});
export type DatasetDtoType = z.infer<typeof DatasetDto>;

export const DatasetsDto = DatasetDto.array();
export type DatasetsDtoType = z.infer<typeof DatasetsDto>;

export const DatasetCreationDto = z.object({
    name:           z.string(),
    description:    z.string().optional(),
    mongooseSchema: z.object().optional()
}).strict();
export type DatasetCreationDtoType = z.infer<typeof DatasetCreationDto>;

export const DatasetUpdateDto = z.object({
    name:           z.string().optional(),
    description:    z.string().optional(),
    mongooseSchema: z.object().optional()
}).strict();
export type DatasetUpdateDtoType = z.infer<typeof DatasetUpdateDto>;

export const DatasetUploadDto = z.object({
    data: z.object().array()
}).strict();
export type DatasetUploadDtoType = z.infer<typeof DatasetUploadDto>;

export const DatasetPathParamsDto = z.object({
    projectObjId: ObjectId,
    datasetObjId: ObjectId
});
export type DatasetPathParamsDtoType = z.infer<typeof DatasetPathParamsDto>;
