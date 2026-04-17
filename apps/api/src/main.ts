import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';

import { logger } from '#/utils/api';
import { apiRouter } from '#/routes';
import { apiConfig } from '#/configs/api';
import { errorHandler, notFoundHandler } from '#/middlewares';


const corsConfig: cors.CorsOptions = {
    origin: apiConfig.corsOrigin,
    methods: apiConfig.corsMethods,
    allowedHeaders: apiConfig.corsAllowedHeaders,
    credentials: apiConfig.corsCredentials,
    optionsSuccessStatus: apiConfig.corsOptionsSuccessStatus
}

const app = express();

app.use(cors(corsConfig))
app.use(cookieParser())
app.use(`/api/${apiConfig.version}`, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(apiConfig.port, apiConfig.host, () => {
    logger.info(`Server listening on ${apiConfig.host}:${apiConfig.port}...`);
});
