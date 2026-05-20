import { Router } from 'express';
import { barcodeLookup, searchFood } from '../controllers/foodController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/search', requireAuth, searchFood);
router.get('/barcode/:barcode', requireAuth, barcodeLookup);

export default router;
