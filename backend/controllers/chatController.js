import Meal from '../models/Meal.js';

// Simple rule-based assistant that summarizes today's progress against goals
export const dailyAssistant = async (req, res) => {
  try {
    // expected in body: { goals: { calories, protein, fats, carbs }, message }
    const { goals = {}, message = '' } = req.body || {};

    // load today's meals for user
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const meals = await Meal.find({ userId: req.userId, date: { $gte: start, $lt: end } });

    const totals = meals.reduce((acc, m) => {
      acc.calories += Number(m.calories || 0);
      acc.protein += Number(m.protein || 0);
      acc.fats += Number(m.fats || 0);
      acc.carbs += Number(m.carbs || 0);
      return acc;
    }, { calories: 0, protein: 0, fats: 0, carbs: 0 });

    const need = {
      calories: Math.round((goals.calories || 0) - totals.calories),
      protein: Math.round((goals.protein || 0) - totals.protein),
      fats: Math.round((goals.fats || 0) - totals.fats),
      carbs: Math.round((goals.carbs || 0) - totals.carbs)
    };

    const lines = [];
    lines.push(`You have consumed ${Math.round(totals.calories)} kcal today.`);
    if (goals.calories) {
      if (need.calories > 0) lines.push(`You need about ${need.calories} kcal more to reach your ${goals.calories} kcal goal.`);
      else lines.push(`You've met or exceeded your calorie goal by ${Math.abs(need.calories)} kcal.`);
    }

    if (goals.protein) {
      if (need.protein > 0) lines.push(`Protein: ${need.protein}g remaining.`);
      else lines.push(`Protein goal met/exceeded by ${Math.abs(need.protein)}g.`);
    }

    if (goals.fats) {
      if (need.fats > 0) lines.push(`Fat: ${need.fats}g remaining.`);
      else lines.push(`Fat goal met/exceeded by ${Math.abs(need.fats)}g.`);
    }

    if (goals.carbs) {
      if (need.carbs > 0) lines.push(`Carbs: ${need.carbs}g remaining.`);
      else lines.push(`Carbs goal met/exceeded by ${Math.abs(need.carbs)}g.`);
    }

    // quick suggestions
    if (need.calories > 0) {
      const suggestion = need.calories > 400 ? 'Consider a balanced meal (e.g., chicken + rice + veggies).' : 'A snack like yogurt or a banana could help.';
      lines.push(suggestion);
    }

    const reply = lines.join(' ');

    return res.json({ reply, totals, need });
  } catch (error) {
    console.error('dailyAssistant error', error);
    return res.status(500).json({ message: 'Assistant failed' });
  }
};

export default { dailyAssistant };
