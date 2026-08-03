import { Router } from 'express';
import { uploadScreenshot, getScreenshotFile, getScreenshots } from '../controllers/screenshotController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Retrieve screenshot file is protected but does check session ownership inside the controller
router.get('/:id', protect, getScreenshotFile);

router.use(protect);
router.post('/upload', uploadScreenshot);
router.get('/', getScreenshots);

export default router;
