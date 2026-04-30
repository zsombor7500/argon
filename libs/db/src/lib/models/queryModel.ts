import { querySchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { IQuery } from '#/db/interfaces';


export const Query = argonDbConnection.model<IQuery>('Query', querySchema);
