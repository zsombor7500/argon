import { z } from 'zod';


export const ProjectScope = [
    'project:all',
    'project:create',
    'project:read',
    'project:update',
    'project:delete',
    'dataset:all',
    'dataset:create',
    'dataset:read',
    'dataset:update',
    'dataset:delete',
    'dataset:ingest',
    'query:all',
    'query:create',
    'query:read',
    'query:update',
    'query:delete',
    'query:execute',
    'access:all',
    'access:read',
    'access:invite:create',
    'access:invite:update',
    'access:invite:delete',
    'access:user:update',
    'access:user:delete'
];
export const ProjectScopeDto = z.enum(ProjectScope);
export type ProjectScopeDtoType = z.infer<typeof ProjectScopeDto>;
