import { inviteSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { IInvite } from '#/db/interfaces';


export const Invite = argonDbConnection.model<IInvite>('Invite', inviteSchema);
