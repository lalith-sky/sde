import { Router } from 'express';
import { analyzeActivity, getActivities, getActivityTimeline } from '../controllers/activityController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/analyze', analyzeActivity);
router.get('/', getActivities);
router.get('/timeline', getActivityTimeline);

export default router;
