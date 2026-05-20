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

const chooseUsdaImage = (food) => {
  // USDA responses vary; try known fields and nested arrays
  if (!food) return '';
  // common photo object
  if (food.photo) {
    if (food.photo.thumb) return food.photo.thumb;
    if (food.photo.small) return food.photo.small;
    if (typeof food.photo === 'string') return food.photo;
  }

  // some responses include 'images' array
  if (Array.isArray(food.images) && food.images.length > 0) {
    const img = food.images[0];
    if (img.small) return img.small;
    if (img.thumb) return img.thumb;
    if (img.src) return img.src;
  }

  // older responses or different shapes
  if (food.image) return food.image;
  if (food.thumbnail) return food.thumbnail;

  return '';
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
  image: chooseUsdaImage(food) || '',
  source: 'usda',
  raw: food
});

const chooseOffImage = (product) => {
  if (!product) return '';
  // common direct urls
  if (product.image_front_small_url) return product.image_front_small_url;
  if (product.image_front_thumb_url) return product.image_front_thumb_url;
  if (product.image_small_url) return product.image_small_url;
  if (product.image_thumb_url) return product.image_thumb_url;
  if (product.image_url) return product.image_url;

  // new OpenFoodFacts shapes
  if (product.selected_images && product.selected_images.front) {
    const front = product.selected_images.front;
    if (front.small && front.small.display) return front.small.display;
    if (front.thumb && front.thumb.display) return front.thumb.display;
  }

  // some products include nested sizes or 'images'
  if (product.images && product.images.front && product.images.front.small) return product.images.front.small;

  return '';
};

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
  // prefer small/thumbnail images when available
  image: chooseOffImage(product) || '',
  source: 'openfoodfacts',
  raw: product
});

export const searchFoods = async (query) => {
  if (!process.env.FOODDATA_CENTRAL_API_KEY) {
    throw new Error('FOODDATA_CENTRAL_API_KEY is not set');
  }
  try {
    const url = new URL(`${USDA_API_ROOT}/foods/search`);
    url.searchParams.set('api_key', process.env.FOODDATA_CENTRAL_API_KEY);
    url.searchParams.set('query', query);
    url.searchParams.set('pageSize', '10');

    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('USDA search error', response.status, body);
      throw new Error('USDA food search failed');
    }

    const data = await response.json();
    return (data.foods || []).map(normalizeUsdaFood);
  } catch (usdaError) {
    // Fallback to Open Food Facts search if USDA fails
    try {
      console.warn('Falling back to OpenFoodFacts search for query:', query);
      const offUrl = new URL(`${OFF_API_ROOT}/cgi/search.pl`);
      offUrl.searchParams.set('search_terms', query);
      offUrl.searchParams.set('search_simple', '1');
      offUrl.searchParams.set('action', 'process');
      offUrl.searchParams.set('json', '1');
      offUrl.searchParams.set('page_size', '10');

      const offResp = await fetch(offUrl);
      if (!offResp.ok) {
        const body = await offResp.text().catch(() => '');
        console.error('OpenFoodFacts search failed', offResp.status, body);
        throw new Error('Food search failed');
      }

      const offData = await offResp.json();
      const products = offData.products || [];
      return products.map((p) => normalizeOffProduct(p, p.code || ''));
    } catch (offError) {
      console.error('Both USDA and OpenFoodFacts searches failed', usdaError, offError);
      throw new Error('Food search failed');
    }
  }
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
