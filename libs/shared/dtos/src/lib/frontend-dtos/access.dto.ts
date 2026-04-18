import { z } from 'zod';

import { ObjectId } from '#/dto/frontend/oid';
import { InviteDto } from '#/dto/frontend/invite';
import { UserProfileDto } from '#/dto/frontend/user';
import { ProjectScopeDto } from '#/dto/frontend/scope';


export const RoleToScopesMap = z.map(z.string(), ProjectScopeDto.array()).transform(map => Object.fromEntries(map));
export type RoleToScopesMapType = z.infer<typeof RoleToScopesMap>;
export const RoleToUserObjIdsMap = z.map(z.string(), ObjectId.array()).transform(map => Object.fromEntries(map));
export type RoleToUserObjIdsMapType = z.infer<typeof RoleToUserObjIdsMap>;

export const AccessDto = z.object({
    users:               UserProfileDto.array(),
    invites:             InviteDto.array(),
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
