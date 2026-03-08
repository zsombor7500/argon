import { projectSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { Project } from '#/db/interfaces';


export const ProjectModel = argonDbConnection.model<Project>('Project', projectSchema);
