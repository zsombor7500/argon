import { inviteSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { Invite } from '#/db/interfaces';


export const InviteModel = argonDbConnection.model<Invite>('Invite', inviteSchema);
