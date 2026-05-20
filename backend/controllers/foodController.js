import { lookupBarcode, searchFoods } from '../services/nutritionService.js';

export const searchFood = async (req, res) => {
  try {
    const query = String(req.query.query || '').trim();
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const foods = await searchFoods(query);
    return res.json({ foods });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Food search failed' });
  }
};

export const barcodeLookup = async (req, res) => {
  try {
    const barcode = String(req.params.barcode || '').trim();
    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }

    const food = await lookupBarcode(barcode);
    if (!food) {
      return res.status(404).json({ message: 'Barcode not found' });
    }

    return res.json({ food });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Barcode lookup failed' });
  }
};
