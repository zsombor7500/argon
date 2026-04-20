import { z } from 'zod';

import { ObjectId } from '#/dto/frontend/oid';
import { UserProfileDto } from '#/dto/frontend/user';
import { Name, Description, DateFromString } from '#/dto/general';


export const ProjectDto = z.object({
    _id:         ObjectId,
    name:        Name,
    description: Description.optional(),
    owner:       UserProfileDto,
    createdAt:   DateFromString,
    updatedAt:   DateFromString
});
export type ProjectDtoType = z.infer<typeof ProjectDto>;

export const ProjectsDto = ProjectDto.array();
export type ProjectsDtoType = z.infer<typeof ProjectsDto>;

export const ProjectCreationDto = z.object({
    name:        Name,
    description: Description.optional(),
}).strict();
export type ProjectCreationDtoType = z.infer<typeof ProjectCreationDto>;

export const ProjectUpdateDto = z.object({
    name:        Name.optional(),
    description: Description.optional(),
}).strict();
export type ProjectUpdateDtoType = z.infer<typeof ProjectUpdateDto>;

export const ProjectPathParamsDto = z.object({
    projectObjId: ObjectId
});
export type ProjectPathParamsDtoType = z.infer<typeof ProjectPathParamsDto>;
