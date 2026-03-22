import express from 'express';

import { logger } from '#/utils/api';
import { apiRouter } from '#/routes';
import { apiConfig } from '#/configs/api';
import { errorHandler, notFoundHandler } from '#/middlewares';


const app = express();

app.use(`/api/${apiConfig.version}`, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(apiConfig.port, apiConfig.host, () => {
    logger.info(`Server listening on ${apiConfig.host}:${apiConfig.port}...`);
});
