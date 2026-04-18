import { z } from 'zod';

import { ObjectId } from '#/dto/frontend/oid';
import { SchemaPrimitiveTypeDto } from '#/dto/frontend/schema';


export const TagTypeDto = SchemaPrimitiveTypeDto;

export const Constraints = z.map(z.string(), z.string()).transform((map) => Object.fromEntries(map));
export type ConstraintsType = z.infer<typeof Constraints>;

export const TagDto = z.object({
    _id:         ObjectId,
    name:        z.string(),
    description: z.string().optional(),
    type:        TagTypeDto,
    createdAt:   z.date(),
    updatedAt:   z.date()
});
export type TagDtoType = z.infer<typeof TagDto>;

export const TagsDto = TagDto.array();
export type TagsDtoType = z.infer<typeof TagsDto>;

export const TagCreationDto = z.object({
    name:        z.string(),
    description: z.string().optional(),
    type:        TagTypeDto
}).strict();
export type TagCreationDtoType = z.infer<typeof TagCreationDto>;

export const TagUpdateDto = z.object({
    name:        z.string().optional(),
    description: z.string().optional(),
}).strict();
export type TagUpdateDtoType = z.infer<typeof TagUpdateDto>;

export const TagPathParamsDto = z.object({
    projectObjId: ObjectId,
    tagObjId:     ObjectId
});
export type TagPathParamsDtoType = z.infer<typeof TagPathParamsDto>;
