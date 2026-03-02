import { userSchema } from '../schemas/index.js';
import { argonDbConnection } from '../dbConnection.js';
import type { User } from '../interfaces/index.js';


export const userModel = argonDbConnection.model<User>('User', userSchema);
