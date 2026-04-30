import mongoose, { Connection } from 'mongoose';

import { dbConfig } from '#/configs/db';


export const argonDbConnection: Connection = mongoose.createConnection(`mongodb://${dbConfig.mongoHost}:${dbConfig.mongoPort}`, {
    dbName: dbConfig.mongoServiceDb,
    user: dbConfig.mongoUser,
    pass: dbConfig.mongoPassword,
    authSource: dbConfig.mongoAuthSource,
    authMechanism: dbConfig.mongoAuthMechanism,
    minPoolSize: dbConfig.mongoServiceDbMinPoolSize,
    maxPoolSize: dbConfig.mongoServiceDbMaxPoolSize,
    serverSelectionTimeoutMS: dbConfig.mongoSelectionTimeoutMs
});
