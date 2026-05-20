import { Router } from 'express';
import { dailyAssistant } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/chat/daily - body: { goals: { calories, protein, fats, carbs }, message }
router.post('/daily', requireAuth, dailyAssistant);

export default router;
