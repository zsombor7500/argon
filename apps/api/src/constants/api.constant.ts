import type { ProjectScopeDtoType } from "#/dto/scope";


export const VERSION_PATTERN = /^v[1-9][0-9]*$/;
export const RES_LOCALS_JWT_KEY = 'jwt';

export const PROJECT_BASE_SCOPES   = new Set<ProjectScopeDtoType>(['project:all'])
export const PROJECT_UPDATE_SCOPES = new Set(PROJECT_BASE_SCOPES).add('project:update');
export const PROJECT_DELETE_SCOPES = new Set(PROJECT_BASE_SCOPES).add('project:delete');

export const DATASET_BASE_SCOPES   = new Set(PROJECT_BASE_SCOPES).add('dataset:all');
export const DATASET_VIEW_SCOPES   = new Set(DATASET_BASE_SCOPES).add('dataset:view');
export const DATASET_CREATE_SCOPES = new Set(DATASET_BASE_SCOPES).add('dataset:create');
export const DATASET_UPDATE_SCOPES = new Set(DATASET_BASE_SCOPES).add('dataset:update');
export const DATASET_DELETE_SCOPES = new Set(DATASET_BASE_SCOPES).add('dataset:delete');
export const DATASET_INGEST_SCOPES = new Set(DATASET_BASE_SCOPES).add('dataset:ingest');

export const QUERY_BASE_SCOPES    = new Set(PROJECT_BASE_SCOPES).add('query:all');
export const QUERY_VIEW_SCOPES    = new Set(QUERY_BASE_SCOPES).add('query:view');
export const QUERY_CREATE_SCOPES  = new Set(QUERY_BASE_SCOPES).add('query:create');
export const QUERY_UPDATE_SCOPES  = new Set(QUERY_BASE_SCOPES).add('query:update');
export const QUERY_DELETE_SCOPES  = new Set(QUERY_BASE_SCOPES).add('query:delete');
export const QUERY_EXECUTE_SCOPES = new Set(QUERY_BASE_SCOPES).add('query:execute');

export const ACCESS_BASE_SCOPES   = new Set(PROJECT_BASE_SCOPES).add('access:all');
export const ACCESS_VIEW_SCOPES   = new Set(ACCESS_BASE_SCOPES).add('access:view');
export const INVITE_CREATE_SCOPES = new Set(ACCESS_BASE_SCOPES).add('access:invite:create');
export const INVITE_UPDATE_SCOPES = new Set(ACCESS_BASE_SCOPES).add('access:invite:update');
export const INVITE_CANCEL_SCOPES = new Set(ACCESS_BASE_SCOPES).add('access:invite:cancel');
export const USER_UPDATE_SCOPES   = new Set(ACCESS_BASE_SCOPES).add('access:user:update');
export const USER_REMOVE_SCOPES   = new Set(ACCESS_BASE_SCOPES).add('access:user:remove');
