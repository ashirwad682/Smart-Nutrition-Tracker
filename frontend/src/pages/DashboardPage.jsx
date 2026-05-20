import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NutritionSummary from '../components/NutritionSummary';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [today, setToday] = useState({ meals: [], totals: { calories: 0, protein: 0, fats: 0, carbs: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToday = async () => {
      try {
        const response = await api.getTodayMeals();
        setToday(response);
      } finally {
        setLoading(false);
      }
    };

    loadToday();
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <p className="eyebrow">Daily nutrition</p>
          <h1>Good to see you, {user?.name || 'there'}.</h1>
          <p>
            Scan a barcode or search a food, then save the meal and watch your totals update in MongoDB-backed history.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" to="/scanner">Scan barcode</Link>
          <Link className="button button-secondary" to="/search">Search food</Link>
        </div>
      </section>

      <NutritionSummary totals={today.totals} />

      <section className="panel split-panel">
        <div>
          <h2>Today’s meals</h2>
          <p>{loading ? 'Loading meals...' : `${today.meals.length} meals logged today`}</p>
        </div>
        <Link className="button button-secondary" to="/history">
          View history
        </Link>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Recent entries</h2>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="meal-list">
          {today.meals.length === 0 ? (
            <p className="empty-state">No meals logged yet today. Search a food or scan a barcode to start.</p>
          ) : (
            today.meals.map((meal) => (
              <article className="meal-item" key={meal._id}>
                <div>
                  <strong>{meal.foodName}</strong>
                  <p>{meal.mealType} · {meal.quantity}{meal.servingUnit} · {new Date(meal.date).toLocaleTimeString()}</p>
                </div>
                <div className="meal-macros">
                  <span>{Math.round(meal.calories)} kcal</span>
                  <span>{Math.round(meal.protein)}g protein</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
