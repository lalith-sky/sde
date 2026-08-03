import dotenv from 'dotenv';
import path from 'path';

// Load environmental config before loading other parts
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app';
import { connectDB } from './database/connection';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Database connection
  await connectDB();

  // 2. HTTP Server listening
  app.listen(PORT, () => {
    logger.info(`Server successfully started in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer().catch((err) => {
  logger.error(`Critical backend startup failure: ${err.message}`);
  process.exit(1);
});
