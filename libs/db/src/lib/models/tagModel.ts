import { tagSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { ITag } from '#/db/interfaces';


export const Tag = argonDbConnection.model<ITag>('Tag', tagSchema);
