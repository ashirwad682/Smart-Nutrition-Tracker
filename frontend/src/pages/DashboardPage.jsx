import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NutritionSummary from '../components/NutritionSummary';
import { useAuth } from '../context/AuthContext';
import { api, resolveApiAssetUrl } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [today, setToday] = useState({ meals: [], totals: { calories: 0, protein: 0, fats: 0, carbs: 0 } });
  const [loading, setLoading] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [photoImagePath, setPhotoImagePath] = useState('');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');

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

  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
    setPhotoAnalysis(null);
    setPhotoImagePath('');
    setPhotoError('');
  };

  const analyzePhoto = async () => {
    if (!photoFile) return setPhotoError('Choose a photo first');
    setPhotoLoading(true);
    setPhotoError('');
    try {
      const res = await api.analyzeMealPhoto(photoFile);
      setPhotoAnalysis(res.analysis);
      setPhotoImagePath(res.file?.imagePath || '');
    } catch (err) {
      setPhotoError(err.message || 'Analysis failed');
    } finally {
      setPhotoLoading(false);
    }
  };

  const saveAnalysis = async () => {
    if (!photoAnalysis) return setPhotoError('No analysis to save');
    setPhotoLoading(true);
    try {
      await api.createMeal({
        foodName: photoAnalysis.foodName || 'Image meal',
        barcode: '',
        quantity: 1,
        calories: Number(photoAnalysis.calories) || 0,
        protein: Number(photoAnalysis.protein) || 0,
        fats: Number(photoAnalysis.fats) || 0,
        carbs: Number(photoAnalysis.carbs) || 0,
        imagePath: photoImagePath,
        mealType: 'snack',
        servingUnit: 'g',
        servingSize: 100,
        source: 'image'
      });
      // refresh today's meals
      const refreshed = await api.getTodayMeals();
      setToday(refreshed);
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoAnalysis(null);
      setPhotoImagePath('');
    } catch (err) {
      setPhotoError(err.message || 'Save failed');
    } finally {
      setPhotoLoading(false);
    }
  };

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
          <Link className="button button-secondary" to="/add-meal/photo">Upload photo</Link>
        </div>
      </section>

      <NutritionSummary totals={today.totals} />

      <section className="panel">
        <h2>Analyze meal photo</h2>
        <p>Upload a photo and the AI will estimate calories and macros for today.</p>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
        {photoPreview ? <img src={photoPreview} alt="preview" style={{ maxWidth: 240, marginTop: 8, borderRadius: 8 }} /> : null}
        <div style={{ marginTop: 8 }}>
          <button className="button button-primary" onClick={analyzePhoto} disabled={photoLoading || !photoFile}>
            {photoLoading ? 'Analyzing...' : 'Analyze photo'}
          </button>
          {photoAnalysis ? (
            <button className="button button-secondary" onClick={saveAnalysis} style={{ marginLeft: 8 }} disabled={photoLoading}>
              Save to today
            </button>
          ) : null}
        </div>
        {photoError ? <div className="error-box">{photoError}</div> : null}
        {photoAnalysis ? (
          <div style={{ marginTop: 12 }} className="summary-grid">
            <div className="summary-card">
              <strong>Calories</strong>
              <div>{photoAnalysis.calories} kcal</div>
            </div>
            <div className="summary-card">
              <strong>Protein</strong>
              <div>{photoAnalysis.protein} g</div>
            </div>
            <div className="summary-card">
              <strong>Fat</strong>
              <div>{photoAnalysis.fats} g</div>
            </div>
            <div className="summary-card">
              <strong>Carbs</strong>
              <div>{photoAnalysis.carbs} g</div>
            </div>
          </div>
        ) : null}
        {photoAnalysis?.foodName ? <p style={{ marginTop: 12 }}><strong>Detected food:</strong> {photoAnalysis.foodName}</p> : null}
      </section>

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
                {meal.imagePath ? (
                  <img
                    src={resolveApiAssetUrl(meal.imagePath)}
                    alt={meal.foodName}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }}
                  />
                ) : null}
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
