import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AddMealPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const food = location.state?.food;
  const [quantity, setQuantity] = useState(food?.quantity || 100);
  const [mealType, setMealType] = useState('breakfast');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const scaled = useMemo(() => {
    if (!food) return null;
    const servingSize = food.servingSize || 100;
    const ratio = Number(quantity) / Number(servingSize || 100);

    return {
      calories: (food.calories || 0) * ratio,
      protein: (food.protein || 0) * ratio,
      fats: (food.fats || 0) * ratio,
      carbs: (food.carbs || 0) * ratio
    };
  }, [food, quantity]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!food) return;

    setSaving(true);
    setError('');

    try {
      await api.createMeal({
        foodName: food.foodName,
        barcode: food.barcode || '',
        quantity: Number(quantity),
        servingSize: food.servingSize || 100,
        servingUnit: food.servingUnit || 'g',
        calories: Math.round(scaled.calories),
        protein: Math.round(scaled.protein),
        fats: Math.round(scaled.fats),
        carbs: Math.round(scaled.carbs),
        mealType,
        source: food.source || 'manual'
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save meal');
    } finally {
      setSaving(false);
    }
  };

  if (!food) {
    return (
      <div className="panel empty-page">
        <h1>No food selected</h1>
        <p>Search for a food or scan a barcode first.</p>
        <Link className="button button-primary" to="/search">
          Search food
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <p className="eyebrow">Confirm meal</p>
        <h1>{food.foodName}</h1>
        <p>{food.source === 'openfoodfacts' ? `Barcode ${food.barcode}` : 'Nutrition result from USDA FoodData Central'}</p>
      </section>

      <section className="panel split-panel">
        <div className="meal-preview">
          <span>{food.calories} kcal / {food.servingSize || 100}{food.servingUnit || 'g'}</span>
          <strong>{food.protein}g protein</strong>
          <strong>{food.fats}g fat</strong>
          <strong>{food.carbs}g carbs</strong>
        </div>

        <form className="auth-form meal-form" onSubmit={handleSave}>
          <label>
            Quantity
            <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
          </label>
          <label>
            Meal type
            <select value={mealType} onChange={(event) => setMealType(event.target.value)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </label>

          <div className="meal-totals">
            <span>{Math.round(scaled?.calories || 0)} kcal</span>
            <span>{Math.round(scaled?.protein || 0)}g protein</span>
            <span>{Math.round(scaled?.fats || 0)}g fat</span>
            <span>{Math.round(scaled?.carbs || 0)}g carbs</span>
          </div>

          {error ? <div className="error-box">{error}</div> : null}
          <div className="button-row">
            <Link className="button button-secondary" to="/search">Back</Link>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save meal'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AddMealPage;
