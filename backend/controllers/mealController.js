import Meal from '../models/Meal.js';
import { analyzeFoodImage } from '../services/visionService.js';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const dayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

const withTotals = (meals) => {
  const totals = meals.reduce(
    (accumulator, meal) => {
      accumulator.calories += meal.calories || 0;
      accumulator.protein += meal.protein || 0;
      accumulator.fats += meal.fats || 0;
      accumulator.carbs += meal.carbs || 0;
      return accumulator;
    },
    { calories: 0, protein: 0, fats: 0, carbs: 0 }
  );

  return {
    meals,
    totals
  };
};

export const createMeal = async (req, res) => {
  try {
    const {
      foodName,
      barcode = '',
      quantity,
      calories,
      protein,
      fats,
      carbs,
      imagePath: incomingImagePath = '',
      mealType = 'snack',
      servingUnit = 'g',
      servingSize = 100,
      source = 'manual',
      date
    } = req.body;

    if (!foodName || !quantity || calories === undefined || protein === undefined || fats === undefined || carbs === undefined) {
      return res.status(400).json({ message: 'Food name, quantity, and nutrition values are required' });
    }

    // If the client provided an external image URL, download and store locally
    let finalImagePath = incomingImagePath || '';
    try {
      if (finalImagePath && (finalImagePath.startsWith('http://') || finalImagePath.startsWith('https://'))) {
        const res = await fetch(finalImagePath);
        if (res.ok) {
          const uploadsDir = path.resolve('uploads');
          await fs.mkdir(uploadsDir, { recursive: true });

          const urlObj = new URL(finalImagePath);
          const ext = path.extname(urlObj.pathname) || '.jpg';
          const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
          const filePath = path.join(uploadsDir, fileName);
          const buffer = Buffer.from(await res.arrayBuffer());
          await fs.writeFile(filePath, buffer);
          finalImagePath = `/uploads/${fileName}`;
        }
      }
    } catch (err) {
      console.warn('Failed to download external image, keeping original path', err && err.message);
      // leave finalImagePath as the original incoming URL if download failed
      finalImagePath = incomingImagePath || '';
    }

    const meal = await Meal.create({
      userId: req.userId,
      foodName,
      barcode,
      quantity,
      calories,
      protein,
      fats,
      carbs,
      imagePath: finalImagePath,
      mealType,
      servingUnit,
      servingSize,
      source,
      date: date || Date.now()
    });

    return res.status(201).json({ meal });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save meal' });
  }
};

export const getTodayMeals = async (req, res) => {
  try {
    const { start, end } = dayRange();
    const meals = await Meal.find({
      userId: req.userId,
      date: { $gte: start, $lt: end }
    }).sort({ date: -1 });

    return res.json(withTotals(meals));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load today\'s meals' });
  }
};

export const getMealHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const meals = await Meal.find(filter).sort({ date: -1 });
    return res.json({ meals });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load meal history' });
  }
};

export const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    return res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete meal' });
  }
};

export const analyzeMealImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Photo is required' });

    // analyze the uploaded image (returns calories/protein/fats/carbs)
    const analysis = await analyzeFoodImage(file.path);
    const imagePath = `/uploads/${path.basename(file.path)}`;

    // don't save automatically — return analysis for confirmation
    return res.json({ analysis, file: { path: file.path, originalname: file.originalname, imagePath } });
  } catch (error) {
    console.error('Image analysis failed', error);
    return res.status(500).json({ message: 'Image analysis failed' });
  }
};
