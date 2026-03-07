import { querySchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { Query } from '#/db/interfaces';


export const queryModel = argonDbConnection.model<Query>('Query', querySchema);
