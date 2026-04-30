import { frontendConfig } from '#/configs/frontend';

export function getApiEndpoint(path: string[] = []): string {
    let assembledPath = '';
    for (const p of path)
        assembledPath += `/${p}`;
    return `${frontendConfig.apiUrl}/api/${frontendConfig.apiVersion}${assembledPath}`;
}
