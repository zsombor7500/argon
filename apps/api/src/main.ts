import express from 'express';

import { apiRouter } from '#/routes';
import { apiConfig } from '#/configs/api';
import { errorHandler, notFoundHandler } from '#/middlewares';


const app = express();

app.use(`/api/${apiConfig.version}`, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(apiConfig.port, apiConfig.host, () => {
    console.log(`Server listening on ${apiConfig.host}:${apiConfig.port}...`);
});
