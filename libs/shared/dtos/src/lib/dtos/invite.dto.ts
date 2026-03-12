import { z } from 'zod';

import { objectId, objectIdToString } from '#/dto/oid';


export const InviteDto = z.object({
    _id:           objectIdToString,
    name:          z.string(),
    description:   z.string().optional(),
    invitantObjId: objectIdToString,
    invitedObjId:  objectIdToString,
    projectObjId:  objectIdToString,
    createdAt:     z.date(),
    updatedAt:     z.date()
});
export type InviteDtoType = z.infer<typeof InviteDto>;

export const InvitesDto = z.array(InviteDto);
export type InvitesDtoType = z.infer<typeof InvitesDto>;

export const InviteCreationDto = z.object({
    name:          z.string(),
    description:   z.string().optional(),
    invitantObjId: objectId,
    invitedObjId:  objectId,
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
    projectObjId: objectId,
    inviteObjId:  objectId
});
export type InvitePathParamsDtoType = z.infer<typeof InvitePathParamsDto>;
