import { z } from 'zod';

import { ObjectId } from '#/dto/frontend/oid';
import { ProjectInviteDto } from '#/dto/frontend/invite';
import { UserProfileDto } from '#/dto/frontend/user';
import { ProjectScopeDto } from '#/dto/frontend/scope';


export const RoleToScopesMap = z.record(z.string(), ProjectScopeDto.array());
export type RoleToScopesMapType = z.infer<typeof RoleToScopesMap>;
export const RoleToUserObjIdsMap = z.record(z.string(), ObjectId.array());
export type RoleToUserObjIdsMapType = z.infer<typeof RoleToUserObjIdsMap>;

export const AccessDto = z.object({
    users:               UserProfileDto.array(),
    invites:             ProjectInviteDto.array(),
    roleToScopesMap:     RoleToScopesMap,
    roleToUserObjIdsMap: RoleToUserObjIdsMap,
});
export type AccessDtoType = z.infer<typeof AccessDto>;

export const UserRoleUpdateDto = z.object({
    newRole: z.string()
}).strict();
export type UserRoleUpdateDtoType = z.infer<typeof UserRoleUpdateDto>;

export const AccessUserPathParamsDto = z.object({
    projectObjId: ObjectId,
    userObjId:    ObjectId
});
export type AccessUserPathParamsDtoType = z.infer<typeof AccessUserPathParamsDto>;
