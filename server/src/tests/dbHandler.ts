import mongoose from 'mongoose';
import logger from '../utils/logger';

const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/visual-ai-agent-test';

export const connectTestDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGO_URI);
    }
  } catch (error) {
    logger.error(`Test DB connection error: ${(error as Error).message}`);
    throw error;
  }
};

export const clearTestDB = async (): Promise<void> => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    logger.error(`Error clearing Test DB: ${(error as Error).message}`);
  }
};

export const disconnectTestDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  } catch (error) {
    logger.error(`Error disconnecting Test DB: ${(error as Error).message}`);
  }
};
