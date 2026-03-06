import express from 'express'

import { apiConfig } from './api.config.js'
import { apiRouter } from './route/index.js'


const app = express();

app.use(`/api/${apiConfig.version}`, apiRouter);

app.listen(apiConfig.port, apiConfig.host, () => {
    console.log(`Server listening on ${apiConfig.host}:${apiConfig.port}...`);
});
