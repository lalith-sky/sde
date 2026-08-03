import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Screenshot from '../database/models/Screenshot';
import Session from '../database/models/Session';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

// Prepare uploads directory
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `screenshot-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
}).single('screenshot');

// @desc    Upload screenshot and record metadata
// @route   POST /api/upload
// @access  Private
export const uploadScreenshot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }

    try {
      const { sessionId } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ success: false, message: 'Please upload an image file' });
        return;
      }

      if (!sessionId) {
        // Cleanup uploaded file
        fs.unlinkSync(file.path);
        res.status(400).json({ success: false, message: 'Please provide sessionId' });
        return;
      }

      const session = await Session.findById(sessionId);
      if (!session) {
        fs.unlinkSync(file.path);
        res.status(404).json({ success: false, message: 'Session not found' });
        return;
      }

      const screenshot = await Screenshot.create({
        sessionId,
        filename: file.filename,
        filepath: file.path,
        mimeType: file.mimetype,
        size: file.size,
      });

      res.status(201).json({
        success: true,
        screenshot,
      });
    } catch (error) {
      logger.error(`Error uploading screenshot: ${(error as Error).message}`);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
};

// @desc    Stream physical screenshot file
// @route   GET /api/screenshots/:id
// @access  Private
export const getScreenshotFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const screenshot = await Screenshot.findById(id);

    if (!screenshot) {
      res.status(404).json({ success: false, message: 'Screenshot not found' });
      return;
    }

    // Verify session belongs to user (unless admin)
    const session = await Session.findById(screenshot.sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Associated session not found' });
      return;
    }

    if (req.user?.role !== 'admin' && session.userId.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: 'Unauthorized access to this screenshot' });
      return;
    }

    if (!fs.existsSync(screenshot.filepath)) {
      res.status(404).json({ success: false, message: 'Physical file not found on server' });
      return;
    }

    res.sendFile(path.resolve(screenshot.filepath));
  } catch (error) {
    logger.error(`Error streaming screenshot file: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get screenshots metadata list
// @route   GET /api/screenshots
// @access  Private
export const getScreenshots = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { sessionId } = req.query;

    let query: any = {};
    if (sessionId) {
      query.sessionId = sessionId;
    } else if (req.user?.role !== 'admin') {
      // If not admin, list only screenshots belonging to user's sessions
      const userSessions = await Session.find({ userId: req.user?.id }).select('_id');
      const sessionIds = userSessions.map((s) => s._id);
      query.sessionId = { $in: sessionIds };
    }

    const screenshots = await Screenshot.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Screenshot.countDocuments(query);

    res.json({
      success: true,
      screenshots,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Error listing screenshots: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
