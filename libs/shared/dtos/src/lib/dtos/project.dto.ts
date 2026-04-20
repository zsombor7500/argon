import { z } from 'zod';

import { ObjectId } from '#/dto/oid';
import { UserProfileDto } from '#/dto/user';
import { Name, Description } from '#/dto/general';


export const ProjectDto = z.object({
    _id:         ObjectId,
    name:        Name,
    owner:       UserProfileDto,
    description: Description.optional(),
    createdAt:   z.date(),
    updatedAt:   z.date()
});
export type ProjectDtoType = z.infer<typeof ProjectDto>;

export const ProjectsDto = ProjectDto.array();
export type ProjectsDtoType = z.infer<typeof ProjectsDto>;

export const ProjectCreationDto = z.object({
    name:        Name,
    description: Description.optional()
}).strict();
export type ProjectCreationDtoType = z.infer<typeof ProjectCreationDto>;

export const ProjectUpdateDto = z.object({
    name:        Name.optional(),
    description: Description.optional()
}).strict();
export type ProjectUpdateDtoType = z.infer<typeof ProjectUpdateDto>;

export const ProjectPathParamsDto = z.object({
    projectObjId: ObjectId
});
export type ProjectPathParamsDtoType = z.infer<typeof ProjectPathParamsDto>;
