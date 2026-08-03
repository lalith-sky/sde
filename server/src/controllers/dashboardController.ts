import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Session from '../database/models/Session';
import Activity from '../database/models/Activity';
import Screenshot from '../database/models/Screenshot';
import Log from '../database/models/Log';
import logger from '../utils/logger';

// Helper to extract hostname from URL
const extractDomain = (urlStr: string): string => {
  try {
    if (!urlStr) return 'Local / Chrome System';
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      return 'System Tab';
    }
    const url = new URL(urlStr);
    return url.hostname;
  } catch (error) {
    return 'Other';
  }
};

// @desc    Get dashboard analytics metrics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!req.user || !userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const sessionQuery = req.user.role === 'admin' ? {} : { userId };

    // 1. Sessions count
    const totalSessions = await Session.countDocuments(sessionQuery);

    // 2. Active Session details
    const activeSession = await Session.findOne({ ...sessionQuery, status: 'active' });

    // 3. Compute total tracked duration
    const sessions = await Session.find(sessionQuery).select('duration');
    const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

    // 4. Screenshots count
    let screenshotQuery: any = {};
    if (req.user.role !== 'admin') {
      const userSessions = await Session.find({ userId }).select('_id');
      screenshotQuery.sessionId = { $in: userSessions.map((s) => s._id) };
    }
    const totalScreenshots = await Screenshot.countDocuments(screenshotQuery);

    // 5. Activities count
    const activityQuery = req.user.role === 'admin' ? {} : { userId };
    const totalActivities = await Activity.countDocuments(activityQuery);

    // 6. Analyze domain frequencies from activities
    const recentActivities = await Activity.find(activityQuery).select('url timestamp').limit(200);
    const domainCounts: { [key: string]: number } = {};

    recentActivities.forEach((act) => {
      const domain = extractDomain(act.url);
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });

    const topDomains = Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 7. Recent activities list
    const recentActivityFeed = await Activity.find(activityQuery)
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('screenshotId');

    // 8. Fetch audit logs (Admins see system logs, regular users see logs related to their own user scope)
    const logQuery = req.user.role === 'admin' ? {} : { 'meta.userId': userId };
    const systemLogs = await Log.find(logQuery).sort({ timestamp: -1 }).limit(10);

    res.json({
      success: true,
      stats: {
        totalSessions,
        totalDuration,
        totalScreenshots,
        totalActivities,
        activeSession: activeSession
          ? {
              id: activeSession._id,
              startTime: activeSession.startTime,
              screenshotInterval: activeSession.screenshotInterval,
            }
          : null,
        topDomains,
      },
      recentActivityFeed,
      systemLogs,
    });
  } catch (error) {
    logger.error(`Error loading dashboard statistics: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
