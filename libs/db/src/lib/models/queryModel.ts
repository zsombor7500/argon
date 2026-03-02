import { querySchema } from '../schemas/index.js';
import { argonDbConnection } from '../dbConnection.js';
import type { Query } from '../interfaces/index.js';


export const queryModel = argonDbConnection.model<Query>('Query', querySchema);
