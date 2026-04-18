import { z } from 'zod';

import { ObjectId } from '#/dto/frontend/oid';
import { ProjectDto } from '#/dto/frontend/project';
import { UserProfileDto } from '#/dto/frontend/user';
import { DateFromString } from '#/dto/frontend/general';


export const InviteDto = z.object({
    _id:         ObjectId,
    name:        z.string(),
    description: z.string().optional(),
    invitant:    UserProfileDto,
    invited:     UserProfileDto,
    project:     ProjectDto,
    createdAt:   DateFromString,
    updatedAt:   DateFromString
});
export type InviteDtoType = z.infer<typeof InviteDto>;

export const InvitesDto = InviteDto.array();
export type InvitesDtoType = z.infer<typeof InvitesDto>;

export const InviteCreationDto = z.object({
    name:         z.string(),
    description:  z.string().optional(),
    invitedObjId: ObjectId,
}).strict();
export type InviteCreationDtoType = z.infer<typeof InviteCreationDto>;

export const InviteUpdateDto = z.object({
    name:        z.string().optional(),
    description: z.string().optional()
}).strict();
export type InviteUpdateDtoType = z.infer<typeof InviteUpdateDto>;

export const InviteDecisionDto = z.object({
    accept: z.boolean()
}).strict();
export type InviteDecisionDtoType = z.infer<typeof InviteDecisionDto>;

export const InvitePathParamsDto = z.object({
    projectObjId: ObjectId,
    inviteObjId:  ObjectId
});
export type InvitePathParamsDtoType = z.infer<typeof InvitePathParamsDto>;
