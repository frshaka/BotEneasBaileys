import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient({
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
});

// Logging de eventos do Prisma
prisma.$on('query', (e) => {
  logger.debug('Query: ' + e.query);
  logger.debug('Params: ' + e.params);
  logger.debug('Duration: ' + e.duration + 'ms');
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error: ', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning: ', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma Info: ', e);
});

export default prisma;