import path from 'path';
import dotenv from 'dotenv';
import { makeValidator, cleanEnv, num, str, port, host } from 'envalid';

import { versionPattern } from './constants.js';


const version = makeValidator((x: string) => {
    if (versionPattern.test(x))
        return x;
    throw new Error(`Supplied version string did not match pattern ${versionPattern}`)
});

const envFilePath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envFilePath });

const apiEnv = cleanEnv(process.env, {
    API_HOST: host(),
    API_PORT: port(),
    API_VERSION: version(),
    API_JWT_EXPIRY: num(),
    API_JWT_SECRET_KEY: str(),
    API_TEST_USERNAME: str(),
    API_TEST_PASSWORD: str()
});

export const apiConfig = {
    isDev: apiEnv.isDevelopment,
    isQa: apiEnv.isTest,
    isProd: apiEnv.isProduction,
    host: apiEnv.API_HOST,
    port: apiEnv.API_PORT,
    version: apiEnv.API_VERSION,
    jwtExpiry: apiEnv.API_JWT_EXPIRY,
    jwtSecretKey: apiEnv.API_JWT_SECRET_KEY,
    testUser: apiEnv.API_TEST_USERNAME,
    testPassword: apiEnv.API_TEST_PASSWORD,
}
