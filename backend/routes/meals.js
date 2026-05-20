import { Router } from 'express';
import { createMeal, deleteMeal, getMealHistory, getTodayMeals } from '../controllers/mealController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, createMeal);
router.get('/today', requireAuth, getTodayMeals);
router.get('/history', requireAuth, getMealHistory);
router.delete('/:id', requireAuth, deleteMeal);

export default router;
