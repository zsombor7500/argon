import { userSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { User } from '#/db/interfaces';


export const UserModel = argonDbConnection.model<User>('User', userSchema);
