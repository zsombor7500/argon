import express from 'express';

import { apiConfig } from '#/configs/api';
import { apiRouter } from '#/routes';


const app = express();

app.use(`/api/${apiConfig.version}`, apiRouter);

app.listen(apiConfig.port, apiConfig.host, () => {
    console.log(`Server listening on ${apiConfig.host}:${apiConfig.port}...`);
});
