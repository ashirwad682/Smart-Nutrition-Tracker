import Meal from '../models/Meal.js';

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
      mealType = 'snack',
      servingUnit = 'g',
      servingSize = 100,
      source = 'manual',
      date
    } = req.body;

    if (!foodName || !quantity || calories === undefined || protein === undefined || fats === undefined || carbs === undefined) {
      return res.status(400).json({ message: 'Food name, quantity, and nutrition values are required' });
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
