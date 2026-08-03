import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visual-ai-agent';
    logger.info(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    logger.info('MongoDB Connected Successfully');
  } catch (error) {
    logger.error(`MongoDB connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected Successfully');
  } catch (error) {
    logger.error(`Error during MongoDB disconnection: ${(error as Error).message}`);
  }
};
