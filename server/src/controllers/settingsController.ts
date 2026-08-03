import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Settings from '../database/models/Settings';
import logger from '../utils/logger';

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let settings = await Settings.findOne({ userId });
    
    // Auto-create default settings if not exists
    if (!settings) {
      settings = await Settings.create({
        userId,
        screenshotInterval: 10,
        captureMode: 'active_tab',
        aiConfidenceThreshold: 0.7,
      });
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    logger.error(`Error loading settings: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Update user settings
// @route   POST /api/settings
// @access  Private
export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { screenshotInterval, captureMode, aiConfidenceThreshold, geminiApiKey } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let settings = await Settings.findOne({ userId });
    if (!settings) {
      settings = new Settings({ userId });
    }

    if (screenshotInterval !== undefined) settings.screenshotInterval = screenshotInterval;
    if (captureMode !== undefined) settings.captureMode = captureMode;
    if (aiConfidenceThreshold !== undefined) settings.aiConfidenceThreshold = aiConfidenceThreshold;
    if (geminiApiKey !== undefined) settings.geminiApiKey = geminiApiKey;

    await settings.save();

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    logger.error(`Error updating settings: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
