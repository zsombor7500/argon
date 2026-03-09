import express from 'express';

import { apiRouter } from '#/routes';
import { apiConfig } from '#/configs/api';


const app = express();

app.use(`/api/${apiConfig.version}`, apiRouter);

app.listen(apiConfig.port, apiConfig.host, () => {
    console.log(`Server listening on ${apiConfig.host}:${apiConfig.port}...`);
});
