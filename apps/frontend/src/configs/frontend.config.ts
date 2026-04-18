export interface Endpoint {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    prefix: string;
}

const apiVersion = 'v1';

const noAuthEndpoints: Endpoint[] = [
    { method: 'POST', prefix: `/api/${apiVersion}/auth/login`},
    { method: 'POST', prefix: `/api/${apiVersion}/users`}
];

export const frontendConfig = {
    apiUrl: 'http://127.0.0.1:9000',
    apiVersion: apiVersion,
    defaultTimeout: 10000,
    noAuthEndpoints: noAuthEndpoints,
    tokenType: 'Bearer'
};
