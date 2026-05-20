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
              <article className="food-card" key={`${food.foodName}-${index}`}>
                {food.image ? (
                  <img src={food.image} alt={food.foodName} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, marginRight: 12 }} />
                ) : null}
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
                <button className="button button-secondary" type="button" onClick={() => openMeal(food)}>
                  Add meal
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default FoodSearchPage;
