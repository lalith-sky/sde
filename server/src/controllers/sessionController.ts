import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Session from '../database/models/Session';
import Settings from '../database/models/Settings';
import logToDB from '../utils/dbLogger';
import logger from '../utils/logger';

// @desc    Start new monitoring session
// @route   POST /api/sessions/start
// @access  Private
export const startSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // End any currently active sessions for this user first
    const activeSession = await Session.findOne({ userId, status: 'active' });
    if (activeSession) {
      activeSession.status = 'ended';
      activeSession.endTime = new Date();
      activeSession.duration = Math.round(
        (activeSession.endTime.getTime() - activeSession.startTime.getTime()) / 1000
      );
      await activeSession.save();
      await logToDB('info', `Auto-terminated running session on start request`, {
        sessionId: activeSession._id,
        userId,
      });
    }

    // Get user settings to obtain the screenshot interval
    const settings = await Settings.findOne({ userId });
    const interval = settings?.screenshotInterval || 10;

    const session = await Session.create({
      userId,
      status: 'active',
      startTime: new Date(),
      screenshotInterval: interval,
    });

    await logToDB('info', `Monitoring session started`, { sessionId: session._id, userId });

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    logger.error(`Error starting session: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    End active monitoring session
// @route   POST /api/sessions/end
// @access  Private
export const endSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Find session (either specific id or the user's latest active session)
    let query: any = { userId, status: 'active' };
    if (sessionId) {
      query = { _id: sessionId, userId };
    }

    const session = await Session.findOne(query);

    if (!session) {
      res.status(404).json({ success: false, message: 'No active session found' });
      return;
    }

    session.status = 'ended';
    session.endTime = new Date();
    session.duration = Math.round(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000
    );

    await session.save();
    await logToDB('info', `Monitoring session ended`, { sessionId: session._id, userId });

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    logger.error(`Error ending session: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get sessions list
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Admins can see all, users only see their own sessions
    const query = req.user?.role === 'admin' ? {} : { userId };

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'userId', select: 'email' });

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Error listing sessions: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
