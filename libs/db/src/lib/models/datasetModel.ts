import { datasetSchema } from '#/db/schemas';
import { argonDbConnection } from '#/db/connections';
import type { IDataset } from '#/db/interfaces';


export const Dataset = argonDbConnection.model<IDataset>('Dataset', datasetSchema);
