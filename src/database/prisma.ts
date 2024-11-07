import { PrismaClient } from '@prisma/client'
import {dbLogger} from "../utils/logger";

export const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
})

prisma.$on('query', (e) => {
    dbLogger.info(e)
})

prisma.$on('error', (e) => {
    dbLogger.error(e)
})

prisma.$on('info', (e) => {
    dbLogger.info(e)
})

prisma.$on('warn', (e) => {
    dbLogger.info(e)
})