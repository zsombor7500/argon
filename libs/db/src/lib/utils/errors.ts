import mongoose from 'mongoose';


export function isDuplicateKeyError(error: unknown): boolean {
    return error instanceof mongoose.MongooseError &&
        error.cause instanceof mongoose.mongo.MongoServerError &&
        error.cause.code === 11000;
}
