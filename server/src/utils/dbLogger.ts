import Log from '../database/models/Log';
import logger from './logger';

export const logToDB = async (
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  meta?: any
): Promise<void> => {
  try {
    await Log.create({ level, message, meta });
  } catch (err) {
    logger.error(`Failed to write log to MongoDB: ${(err as Error).message}`);
  }
};

export default logToDB;
