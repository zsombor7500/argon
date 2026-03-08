import { querySchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { Query } from '#/db/interfaces';


export const QueryModel = argonDbConnection.model<Query>('Query', querySchema);
