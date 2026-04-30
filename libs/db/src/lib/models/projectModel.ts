import { projectSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { IProject } from '#/db/interfaces';


export const Project = argonDbConnection.model<IProject>('Project', projectSchema);
