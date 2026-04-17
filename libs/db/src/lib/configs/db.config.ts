import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, num, str, port, host } from 'envalid';


const envFilePath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envFilePath });

const dbEnv = cleanEnv(process.env, {
    MONGO_HOST: host(),
    MONGO_PORT: port(),
    MONGO_INITDB_ROOT_USERNAME: str(),
    MONGO_INITDB_ROOT_PASSWORD: str(),
    MONGO_AUTH_SOURCE: str(),
    MONGO_AUTH_MECHANISM: str({ choices: ['SCRAM-SHA-256', 'MONGODB-X509']}),
    MONGO_SERVICE_DB: str(),
    MONGO_SERVICE_DB_MIN_POOL_SIZE: num({ devDefault: 1 }),
    MONGO_SERVICE_DB_MAX_POOL_SIZE: num({ devDefault: 10 }),
    MONGO_USER_CONTENT_DB: str(),
    MONGO_USER_CONTENT_DB_MIN_POOL_SIZE: num({ devDefault: 1 }),
    MONGO_USER_CONTENT_DB_MAX_POOL_SIZE: num({ devDefault: 1000 }),
    MONGO_SELECTION_TIMEOUT_MS: num({ devDefault: 60000 })
});

export const dbConfig = {
    mongoHost: dbEnv.MONGO_HOST,
    mongoPort: dbEnv.MONGO_PORT,
    mongoUser: dbEnv.MONGO_INITDB_ROOT_USERNAME,
    mongoPassword: dbEnv.MONGO_INITDB_ROOT_PASSWORD,
    mongoAuthSource: dbEnv.MONGO_AUTH_SOURCE,
    mongoAuthMechanism: dbEnv.MONGO_AUTH_MECHANISM,
    mongoServiceDb: dbEnv.MONGO_SERVICE_DB,
    mongoServiceDbMinPoolSize: dbEnv.MONGO_SERVICE_DB_MIN_POOL_SIZE,
    mongoServiceDbMaxPoolSize: dbEnv.MONGO_SERVICE_DB_MAX_POOL_SIZE,
    mongoUserContentDb: dbEnv.MONGO_USER_CONTENT_DB,
    mongoUserContentDbMinPoolSize: dbEnv.MONGO_USER_CONTENT_DB_MIN_POOL_SIZE,
    mongoUserContentDbMaxPoolSize: dbEnv.MONGO_USER_CONTENT_DB_MAX_POOL_SIZE,
    mongoSelectionTimeoutMs: dbEnv.MONGO_SELECTION_TIMEOUT_MS
};
