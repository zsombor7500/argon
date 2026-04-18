import path from 'path';

import {
    num,
    str,
    port,
    host,
    cleanEnv,
    makeValidator
} from 'envalid';
import dotenv from 'dotenv';
import winston from 'winston';

import { VERSION_PATTERN } from '#/constants/api';


const version = makeValidator((x: string) => {
    if (VERSION_PATTERN.test(x))
        return x;
    throw new Error(`Supplied version string did not match pattern ${VERSION_PATTERN}`);
});

const envFilePath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envFilePath });

const apiEnv = cleanEnv(process.env, {
    API_HOST: host(),
    API_PORT: port(),
    API_VERSION: version(),
    API_SALT_ROUNDS: num(),
    API_ACCESS_JWT_EXPIRY: num(),
    API_ACCESS_JWT_SECRET: str(),
    API_REFRESH_JWT_EXPIRY: num(),
    API_REFRESH_JWT_SECRET: str(),
    CORS_ORIGIN: str()
});

export const apiConfig = {
    isDev: apiEnv.isDevelopment,
    isQa: apiEnv.isTest,
    isProd: apiEnv.isProduction,
    isSecure: apiEnv.isProduction,
    logLevel: apiEnv.isProduction ? 'info' : 'debug',
    logFormat: apiEnv.isProduction ? winston.format.json() : winston.format.cli(),
    host: apiEnv.API_HOST,
    port: apiEnv.API_PORT,
    version: apiEnv.API_VERSION,
    saltRounds: apiEnv.API_SALT_ROUNDS,
    accessJwtExpiry: apiEnv.API_ACCESS_JWT_EXPIRY,
    accessJwtSecret: apiEnv.API_ACCESS_JWT_SECRET,
    refreshJwtExpiry: apiEnv.API_REFRESH_JWT_EXPIRY,
    refreshJwtSecret: apiEnv.API_REFRESH_JWT_SECRET,
    corsOrigin: !apiEnv.isProduction ? ['http://127.0.0.1:4200', 'http://localhost:4200'] : apiEnv.CORS_ORIGIN,
    corsMethods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    corsAllowedHeaders: ['Content-Type', 'Authorization'],
    corsCredentials: true,
    corsOptionsSuccessStatus: 200
};


