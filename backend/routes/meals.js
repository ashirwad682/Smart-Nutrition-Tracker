import { Router } from 'express';
import multer from 'multer';
import { createMeal, deleteMeal, getMealHistory, getTodayMeals, analyzeMealImage } from '../controllers/mealController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ dest: './uploads/' });

router.post('/', requireAuth, createMeal);
router.post('/analyze', requireAuth, upload.single('photo'), analyzeMealImage);
router.get('/today', requireAuth, getTodayMeals);
router.get('/history', requireAuth, getMealHistory);
router.delete('/:id', requireAuth, deleteMeal);

export default router;
