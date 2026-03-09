import morgan from 'morgan';
import winston from 'winston';

import { apiConfig } from '#/configs/api';


const { combine, timestamp } = winston.format;

export const logger = winston.createLogger({
    level: apiConfig.logLevel,
    format: combine(
        timestamp(),
        apiConfig.logFormat
    ),
    transports: [
        new winston.transports.Console()
    ]
});

export const winstonHttpLogStream: morgan.StreamOptions = {
    write: (msg: string) => logger.info(msg)
};
