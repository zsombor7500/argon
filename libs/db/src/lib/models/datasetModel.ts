import { datasetSchema } from '../schemas/index.js';
import { argonDbConnection } from '../dbConnection.js';
import type { Dataset } from '../interfaces/index.js';


export const datasetModel = argonDbConnection.model<Dataset>('Dataset', datasetSchema);
