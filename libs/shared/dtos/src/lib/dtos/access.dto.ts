import { z } from 'zod';

import { ObjectId } from '#/dto/oid';
import { ProjectInviteDto } from '#/dto/invite';
import { UserProfileDto } from '#/dto/user';
import { ProjectScopeDto } from '#/dto/scope';


export const RoleToScopesMap = z.map(z.string(), ProjectScopeDto.array()).transform(map => Object.fromEntries(map));
export type RoleToScopesMapType = z.infer<typeof RoleToScopesMap>;
export const RoleToUserObjIdsMap = z.map(z.string(), ObjectId.array()).transform(map => Object.fromEntries(map));
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
