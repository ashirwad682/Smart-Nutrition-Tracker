import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const FoodSearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.searchFood(query.trim());
      setResults(response.foods || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const openMeal = (food) => {
    navigate('/add-meal', { state: { food } });
  };

  const [savingMap, setSavingMap] = useState({});

  const saveFoodToDB = async (food, idx) => {
    const key = `${food.foodName}-${idx}`;
    setSavingMap((m) => ({ ...m, [key]: 'saving' }));

    try {
      await api.createMeal({
        foodName: food.foodName,
        barcode: food.barcode || '',
        quantity: 1,
        calories: Number(food.calories) || 0,
        protein: Number(food.protein) || 0,
        fats: Number(food.fats) || 0,
        carbs: Number(food.carbs) || 0,
        mealType: 'snack',
        servingUnit: food.servingUnit || 'g',
        servingSize: food.servingSize || 100,
        source: 'search'
      });

      setSavingMap((m) => ({ ...m, [key]: 'saved' }));
      setTimeout(() => setSavingMap((m) => { const copy = { ...m }; delete copy[key]; return copy; }), 1800);
    } catch (err) {
      setSavingMap((m) => ({ ...m, [key]: 'error' }));
      setTimeout(() => setSavingMap((m) => { const copy = { ...m }; delete copy[key]; return copy; }), 2800);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <h1>Food search</h1>
        <p>Search USDA FoodData Central for calorie and macro details.</p>
        <form className="search-bar" onSubmit={handleSearch}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="rice, chicken, apple, milk" />
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error ? <div className="error-box">{error}</div> : null}
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Results</h2>
          <span>{results.length} foods</span>
        </div>
        <div className="food-grid">
          {results.length === 0 ? (
            <p className="empty-state">Search a food to see nutrition results.</p>
          ) : (
            results.map((food, index) => (
              <article className="food-card fade-in" key={`${food.foodName}-${index}`}>
                <div>
                  <h3>{food.foodName}</h3>
                  <p>{food.servingSize} {food.servingUnit} serving</p>
                </div>
                <div className="macro-row">
                  <span>{food.calories} kcal</span>
                  <span>{food.protein}g protein</span>
                  <span>{food.fats}g fat</span>
                  <span>{food.carbs}g carbs</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="button button-secondary" type="button" onClick={() => openMeal(food)}>
                    Add meal
                  </button>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => saveFoodToDB(food, index)}
                    disabled={Boolean(savingMap[`${food.foodName}-${index}`])}
                  >
                    {savingMap[`${food.foodName}-${index}`] === 'saving' ? 'Saving...' : savingMap[`${food.foodName}-${index}`] === 'saved' ? 'Saved' : 'Save'}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default FoodSearchPage;
