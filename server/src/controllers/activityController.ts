import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Activity from '../database/models/Activity';
import Screenshot from '../database/models/Screenshot';
import Session from '../database/models/Session';
import Settings from '../database/models/Settings';
import { uploadMiddleware } from './screenshotController';
import { analyzeScreen } from '../services/aiService';
import logToDB from '../utils/dbLogger';
import logger from '../utils/logger';
import fs from 'fs';

// @desc    Analyze screen screenshot using Gemini AI / Mock AI
// @route   POST /api/activities/analyze
// @access  Private
export const analyzeActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }

    const file = req.file;
    const { sessionId, pageTitle, url } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      if (file) fs.unlinkSync(file.path);
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!file) {
      res.status(400).json({ success: false, message: 'Please upload a screenshot file' });
      return;
    }

    if (!sessionId) {
      fs.unlinkSync(file.path);
      res.status(400).json({ success: false, message: 'Please provide sessionId' });
      return;
    }

    try {
      // Verify session exists
      const session = await Session.findById(sessionId);
      if (!session) {
        fs.unlinkSync(file.path);
        res.status(404).json({ success: false, message: 'Session not found' });
        return;
      }

      // 1. Create temporary Screenshot entry to get an ID
      const screenshot = await Screenshot.create({
        sessionId,
        filename: file.filename,
        filepath: file.path,
        mimeType: file.mimetype,
        size: file.size,
      });

      // 2. Fetch User's Settings to see if there's a stored Gemini API Key
      const userSettings = await Settings.findOne({ userId });
      const userApiKey = userSettings?.geminiApiKey || '';

      // 3. Process image with AI
      const aiResult = await analyzeScreen(
        file.path,
        file.mimetype,
        pageTitle || 'Browser Tab',
        url || '',
        userApiKey
      );

      // 4. Create Activity record
      const activity = await Activity.create({
        sessionId,
        userId,
        timestamp: new Date(),
        pageTitle: aiResult.pageTitle,
        url: aiResult.url,
        summary: aiResult.summary,
        detectedTexts: aiResult.detectedTexts,
        confidence: aiResult.confidence,
        screenshotId: screenshot._id,
      });

      // 5. Update Screenshot with the activity ID
      screenshot.activityId = activity._id;
      await screenshot.save();

      await logToDB('info', `Screenshot analyzed successfully: ${aiResult.pageTitle}`, {
        sessionId,
        activityId: activity._id,
        url: aiResult.url,
      });

      res.status(201).json({
        success: true,
        activity,
      });
    } catch (error) {
      logger.error(`Error in activity analyze handler: ${(error as Error).message}`);
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
};

// @desc    Get activities list with filtering/searching
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { sessionId, q, startDate, endDate } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const query: any = {};
    
    // Scoping to current user if not admin
    if (req.user?.role !== 'admin') {
      query.userId = userId;
    }

    if (sessionId) {
      query.sessionId = sessionId;
    }

    // Text search query
    if (q) {
      query.$text = { $search: q as string };
    }

    // Date range filtering
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('screenshotId');

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Error listing activities: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get activity timeline
// @route   GET /api/activities/timeline
// @access  Private
export const getActivityTimeline = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'sessionId is required for timeline' });
      return;
    }

    // Verify session belongs to user (unless admin)
    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    if (req.user?.role !== 'admin' && session.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized session access' });
      return;
    }

    const activities = await Activity.find({ sessionId })
      .sort({ timestamp: 1 }) // Chronological order for timeline
      .populate('screenshotId');

    res.json({
      success: true,
      session,
      activities,
    });
  } catch (error) {
    logger.error(`Error loading timeline: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
