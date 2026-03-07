import mongoose, { Mongoose } from 'mongoose';

import { dbConfig } from '#/configs/db';


export const argonDbConnection: Mongoose = await mongoose.connect(`mongodb://127.0.0.1:27017`, {
    dbName: dbConfig.mongoServiceDb,
    user: dbConfig.mongoUser,
    pass: dbConfig.mongoPassword,
    authSource: dbConfig.mongoAuthSource,
    authMechanism: dbConfig.mongoAuthMechanism,
    minPoolSize: dbConfig.mongoServiceDbMinPoolSize,
    maxPoolSize: dbConfig.mongoServiceDbMaxPoolSize,
    serverSelectionTimeoutMS: dbConfig.mongoSelectionTimeoutMs
});
