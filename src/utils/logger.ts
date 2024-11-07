import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const transportError: DailyRotateFile = new DailyRotateFile({
    filename: './src/storage/logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    level: 'error',
    zippedArchive: false,
    maxSize: '50m',
    maxFiles: '14d',
    handleExceptions: true,
});
const transportInfo: DailyRotateFile = new DailyRotateFile({
    filename: './src/storage/logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    level: 'info',
    zippedArchive: false,
    maxSize: '50m',
    maxFiles: '14d'
});

const dbTransportError: DailyRotateFile = new DailyRotateFile({
    filename: './src/storage/logs/db-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    level: 'error',
    zippedArchive: false,
    maxSize: '50m',
    maxFiles: '14d',
    handleExceptions: true,
});

const dbTransportInfo: DailyRotateFile = new DailyRotateFile({
    filename: './src/storage/logs/db-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    level: 'info',
    zippedArchive: false,
    maxSize: '50m',
    maxFiles: '14d'
});


export const appLogger = winston.createLogger({
    transports: [
        transportInfo
    ],
    exceptionHandlers: [
        transportError
    ]
});

export const dbLogger = winston.createLogger({
    transports: [
        dbTransportInfo
    ],
    exceptionHandlers: [
       dbTransportError
    ]
});