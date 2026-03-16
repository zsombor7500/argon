import mongoose, { Mongoose } from 'mongoose';

import { dbConfig } from '#/configs/db';


export const userContentDbConnection: Mongoose = await mongoose.connect(`mongodb://${dbConfig.mongoHost}:${dbConfig.mongoPort}`, {
    dbName: dbConfig.mongoUserContentDb,
    user: dbConfig.mongoUser,
    pass: dbConfig.mongoPassword,
    authSource: dbConfig.mongoAuthSource,
    authMechanism: dbConfig.mongoAuthMechanism,
    minPoolSize: dbConfig.mongoUserContentDbMinPoolSize,
    maxPoolSize: dbConfig.mongoUserContentDbMaxPoolSize,
    serverSelectionTimeoutMS: dbConfig.mongoSelectionTimeoutMs
});
