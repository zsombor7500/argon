import express from 'express';
import cookieParser from 'cookie-parser';

import { logger } from '#/utils/api';
import { apiRouter } from '#/routes';
import { apiConfig } from '#/configs/api';
import { errorHandler, notFoundHandler } from '#/middlewares';


const app = express();

app.use(cookieParser())
app.use(`/api/${apiConfig.version}`, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(apiConfig.port, apiConfig.host, () => {
    logger.info(`Server listening on ${apiConfig.host}:${apiConfig.port}...`);
});
