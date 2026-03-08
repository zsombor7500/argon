import { userSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { IUser } from '#/db/interfaces';


export const User = argonDbConnection.model<IUser>('User', userSchema);
