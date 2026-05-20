import fs from 'fs';

// Simple vision service placeholder. Replace with call to real AI provider.
export const analyzeFoodImage = async (filePath) => {
  // If a real AI key and endpoint are available, call them here.
  // For now return a naive placeholder response based on file size.
  try {
    const stats = fs.statSync(filePath);
    const sizeKb = Math.max(1, Math.round(stats.size / 1024));

    // Heuristic: larger images -> slightly higher calories estimate (placeholder)
    const calories = Math.min(1200, Math.round(150 + sizeKb / 4));
    const protein = Math.round(Math.max(0, (calories * 0.12) / 4));
    const fats = Math.round(Math.max(0, (calories * 0.28) / 9));
    const carbs = Math.round(Math.max(0, (calories - (protein * 4 + fats * 9)) / 4));

    return {
      foodName: 'Food (image)',
      calories,
      protein,
      fats,
      carbs,
      confidence: 0.45
    };
  } catch (err) {
    return {
      foodName: 'Unknown (image)',
      calories: 0,
      protein: 0,
      fats: 0,
      carbs: 0,
      confidence: 0
    };
  }
};
