import { z } from 'zod';


export const ProjectScopeDto = z.enum([
    'project:all',
    'project:update',
    'project:delete',
    'dataset:all',
    'dataset:view',
    'dataset:create',
    'dataset:update',
    'dataset:delete',
    'dataset:ingest',
    'query:all',
    'query:view',
    'query:create',
    'query:update',
    'query:delete',
    'query:execute',
    'access:all',
    'access:view',
    'access:invite:create',
    'access:invite:update',
    'access:invite:cancel',
    'access:user:update',
    'access:user:remove'
])
export type ProjectScopeDtoType = z.infer<typeof ProjectScopeDto>;
