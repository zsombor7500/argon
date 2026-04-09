import type { ProjectScopeDtoType } from "#/dto/scope";


export const VERSION_PATTERN = /^v[1-9][0-9]*$/;
export const HASH_ALGORITHM = 'sha512';

export const RES_LOCALS_JWT_KEY = 'jwt';

export const PROJECT_BASE_SCOPES   = new Set<ProjectScopeDtoType>(['project:all']);
export const PROJECT_READ_SCOPES   = new Set(PROJECT_BASE_SCOPES).add('project:read');
export const PROJECT_CREATE_SCOPES = new Set(PROJECT_BASE_SCOPES).add('project:create');
export const PROJECT_UPDATE_SCOPES = new Set(PROJECT_BASE_SCOPES).add('project:update');
export const PROJECT_DELETE_SCOPES = new Set(PROJECT_BASE_SCOPES).add('project:delete');

export const TAG_BASE_SCOPES   = new Set<ProjectScopeDtoType>(['tag:all']);
export const TAG_READ_SCOPES   = TAG_BASE_SCOPES.union(PROJECT_READ_SCOPES).add('tag:read');
export const TAG_CREATE_SCOPES = TAG_BASE_SCOPES.union(PROJECT_CREATE_SCOPES).add('tag:create');
export const TAG_UPDATE_SCOPES = TAG_BASE_SCOPES.union(PROJECT_UPDATE_SCOPES).add('tag:update');
export const TAG_DELETE_SCOPES = TAG_BASE_SCOPES.union(PROJECT_DELETE_SCOPES).add('tag:delete');

export const DATASET_BASE_SCOPES   = new Set<ProjectScopeDtoType>(['dataset:all']);
export const DATASET_READ_SCOPES   = DATASET_BASE_SCOPES.union(PROJECT_READ_SCOPES).add('dataset:read');
export const DATASET_CREATE_SCOPES = DATASET_BASE_SCOPES.union(PROJECT_CREATE_SCOPES).add('dataset:create');
export const DATASET_UPDATE_SCOPES = DATASET_BASE_SCOPES.union(PROJECT_UPDATE_SCOPES).add('dataset:update');
export const DATASET_DELETE_SCOPES = DATASET_BASE_SCOPES.union(PROJECT_DELETE_SCOPES).add('dataset:delete');
export const DATASET_INGEST_SCOPES = new Set(DATASET_BASE_SCOPES).add('dataset:ingest');

export const QUERY_BASE_SCOPES    = new Set<ProjectScopeDtoType>(['query:all']);
export const QUERY_READ_SCOPES    = QUERY_BASE_SCOPES.union(PROJECT_READ_SCOPES).add('query:read');
export const QUERY_CREATE_SCOPES  = QUERY_BASE_SCOPES.union(PROJECT_CREATE_SCOPES).add('query:create');
export const QUERY_UPDATE_SCOPES  = QUERY_BASE_SCOPES.union(PROJECT_UPDATE_SCOPES).add('query:update');
export const QUERY_DELETE_SCOPES  = QUERY_BASE_SCOPES.union(PROJECT_DELETE_SCOPES).add('query:delete');
export const QUERY_EXECUTE_SCOPES = new Set(QUERY_BASE_SCOPES).add('query:execute');

export const ACCESS_BASE_SCOPES   = new Set<ProjectScopeDtoType>(['access:all']);
export const ACCESS_READ_SCOPES   = ACCESS_BASE_SCOPES.union(PROJECT_READ_SCOPES).add('access:read');
export const INVITE_CREATE_SCOPES = ACCESS_BASE_SCOPES.union(PROJECT_CREATE_SCOPES).add('access:invite:create');
export const INVITE_UPDATE_SCOPES = ACCESS_BASE_SCOPES.union(PROJECT_UPDATE_SCOPES).add('access:invite:update');
export const INVITE_DELETE_SCOPES = ACCESS_BASE_SCOPES.union(PROJECT_DELETE_SCOPES).add('access:invite:delete');
export const USER_UPDATE_SCOPES   = ACCESS_BASE_SCOPES.union(PROJECT_UPDATE_SCOPES).add('access:user:update');
export const USER_DELETE_SCOPES   = ACCESS_BASE_SCOPES.union(PROJECT_DELETE_SCOPES).add('access:user:delete');
