import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Vision service: If GEMINI_API_KEY and GEMINI_API_URL are set, call the
// provided endpoint with the image. Otherwise fall back to a lightweight
// heuristic based on file size. The expected AI response is JSON with keys
// { foodName, calories, protein, fats, carbs, confidence } — if not present,
// heuristic values are used.
export const analyzeFoodImage = async (filePath) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = process.env.GEMINI_API_URL; // e.g. https://api.example.com/v1/analyze

  // Helper heuristic when no AI provider or when provider fails
  const heuristic = () => {
    try {
      const stats = fs.statSync(filePath);
      const sizeKb = Math.max(1, Math.round(stats.size / 1024));
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
        confidence: 0.38
      };
    } catch (err) {
      return { foodName: 'Unknown (image)', calories: 0, protein: 0, fats: 0, carbs: 0, confidence: 0 };
    }
  };

  if (!apiKey || !apiUrl) {
    return heuristic();
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: form
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      console.error('AI vision provider error', resp.status, text);
      return heuristic();
    }

    const data = await resp.json().catch(() => null);
    if (!data) return heuristic();

    // Prefer structured fields if present
    const { foodName, calories, protein, fats, carbs, confidence } = data;
    if ([calories, protein, fats, carbs].some((v) => v === undefined)) {
      return heuristic();
    }

    return {
      foodName: foodName || 'Food (image)',
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      fats: Number(fats) || 0,
      carbs: Number(carbs) || 0,
      confidence: Number(confidence) || 0
    };
  } catch (err) {
    console.error('Vision service failed', err);
    return heuristic();
  }
};
