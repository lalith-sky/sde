import { Router } from 'express';
import { startSession, endSession, getSessions } from '../controllers/sessionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/start', startSession);
router.post('/end', endSession);
router.get('/', getSessions);

export default router;
