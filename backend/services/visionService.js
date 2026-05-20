import fs from 'fs';

const DEFAULT_GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Vision service: call Gemini generateContent with the uploaded meal image.
// If Gemini is not configured or returns an unexpected response, fall back
// to a lightweight heuristic so the app still works locally.
export const analyzeFoodImage = async (filePath) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = process.env.GEMINI_API_URL || DEFAULT_GEMINI_API_URL;

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
    const mimeType = 'image/jpeg';
    const imageBase64 = fs.readFileSync(filePath).toString('base64');
    const prompt = [
      'Analyze this meal photo and return ONLY valid JSON with these keys:',
      '{"foodName":"string","calories":number,"protein":number,"fats":number,"carbs":number,"confidence":number}',
      'Estimate values for the single visible meal. Use integers for calories/protein/fats/carbs.',
      'Do not include markdown, code fences, or any extra text.'
    ].join(' ');

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512
        }
      })
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      console.error('AI vision provider error', resp.status, text);
      return heuristic();
    }

    const data = await resp.json().catch(() => null);
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';

    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsed = cleaned ? JSON.parse(cleaned) : null;
    if (!parsed) return heuristic();

    const calories = Number(parsed.calories);
    const protein = Number(parsed.protein);
    const fats = Number(parsed.fats);
    const carbs = Number(parsed.carbs);

    if ([calories, protein, fats, carbs].some((value) => Number.isNaN(value))) {
      return heuristic();
    }

    return {
      foodName: parsed.foodName || 'Food (image)',
      calories,
      protein,
      fats,
      carbs,
      confidence: Number(parsed.confidence) || 0
    };
  } catch (err) {
    console.error('Vision service failed', err);
    return heuristic();
  }
};
