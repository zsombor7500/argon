import { projectSchema } from '../schemas/index.js';
import { argonDbConnection } from '../dbConnection.js';
import type { Project } from '../interfaces/index.js';


export const projectModel = argonDbConnection.model<Project>('Project', projectSchema);
