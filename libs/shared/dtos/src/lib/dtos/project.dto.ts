import { z } from 'zod';

import { ObjectId } from '#/dto/oid';
import { UserProfileDto } from '#/dto/user';


export const ProjectDto = z.object({
    _id:         ObjectId,
    name:        z.string(),
    owner:       UserProfileDto,
    description: z.string().optional(),
    createdAt:   z.date(),
    updatedAt:   z.date()
});
export type ProjectDtoType = z.infer<typeof ProjectDto>;

export const ProjectsDto = ProjectDto.array();
export type ProjectsDtoType = z.infer<typeof ProjectsDto>;

export const ProjectCreationDto = z.object({
    name:        z.string(),
    description: z.string().optional()
}).strict();
export type ProjectCreationDtoType = z.infer<typeof ProjectCreationDto>;

export const ProjectUpdateDto = z.object({
    name:        z.string().optional(),
    description: z.string().optional()
}).strict();
export type ProjectUpdateDtoType = z.infer<typeof ProjectUpdateDto>;

export const ProjectPathParamsDto = z.object({
    projectObjId: ObjectId
});
export type ProjectPathParamsDtoType = z.infer<typeof ProjectPathParamsDto>;
