import { inviteSchema } from '../schemas/index.js';
import { argonDbConnection } from '../dbConnection.js';
import type { Invite } from '../interfaces/index.js';


export const inviteModel = argonDbConnection.model<Invite>('Invite', inviteSchema);
