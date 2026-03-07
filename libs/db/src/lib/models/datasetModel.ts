import { datasetSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { Dataset } from '#/db/interfaces';


export const datasetModel = argonDbConnection.model<Dataset>('Dataset', datasetSchema);
