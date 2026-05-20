const USDA_API_ROOT = 'https://api.nal.usda.gov/fdc/v1';
const OFF_API_ROOT = 'https://world.openfoodfacts.org/api/v2';

const nutrientValueFromList = (nutrients, ids) => {
  const list = Array.isArray(nutrients) ? nutrients : [];
  for (const id of ids) {
    const nutrient = list.find((item) => item.nutrientId === id);
    if (nutrient && typeof nutrient.value === 'number') {
      return nutrient.value;
    }
  }
  return 0;
};

const normalizeUsdaFood = (food) => ({
  foodName: food.description || 'Unknown food',
  barcode: '',
  quantity: 1,
  servingSize: food.servingSize || 100,
  servingUnit: food.servingSizeUnit || 'g',
  calories: Math.round(nutrientValueFromList(food.foodNutrients, [1008, 208])),
  protein: Math.round(nutrientValueFromList(food.foodNutrients, [1003, 203])),
  fats: Math.round(nutrientValueFromList(food.foodNutrients, [1004, 204])),
  carbs: Math.round(nutrientValueFromList(food.foodNutrients, [1005, 205])),
  source: 'usda',
  raw: food
});

const normalizeOffProduct = (product, barcode) => ({
  foodName: product.product_name || product.generic_name || 'Unknown product',
  barcode,
  quantity: 1,
  servingSize: 100,
  servingUnit: 'g',
  calories: Math.round(Number(product.nutriments?.['energy-kcal_100g'] || product.nutriments?.energy_kcal_100g || 0)),
  protein: Math.round(Number(product.nutriments?.proteins_100g || 0)),
  fats: Math.round(Number(product.nutriments?.fat_100g || 0)),
  carbs: Math.round(Number(product.nutriments?.carbohydrates_100g || 0)),
  source: 'openfoodfacts',
  raw: product
});

export const searchFoods = async (query) => {
  if (!process.env.FOODDATA_CENTRAL_API_KEY) {
    throw new Error('FOODDATA_CENTRAL_API_KEY is not set');
  }

  const url = new URL(`${USDA_API_ROOT}/foods/search`);
  url.searchParams.set('api_key', process.env.FOODDATA_CENTRAL_API_KEY);
  url.searchParams.set('query', query);
  url.searchParams.set('pageSize', '10');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('USDA food search failed');
  }

  const data = await response.json();
  return (data.foods || []).map(normalizeUsdaFood);
};

export const lookupBarcode = async (barcode) => {
  const response = await fetch(`${OFF_API_ROOT}/product/${encodeURIComponent(barcode)}.json`);
  if (!response.ok) {
    throw new Error('Open Food Facts request failed');
  }

  const data = await response.json();
  if (data.status !== 1 || !data.product) {
    return null;
  }

  return normalizeOffProduct(data.product, barcode);
};
