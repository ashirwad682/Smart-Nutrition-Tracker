import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const PhotoMealPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [imagePath, setImagePath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAnalysis(null);
    setImagePath('');
    setError('');
  };

  const handleAnalyze = async () => {
    if (!file) return setError('Please choose a photo');
    setLoading(true);
    setError('');
    try {
      const res = await api.analyzeMealPhoto(file);
      setAnalysis(res.analysis);
      setImagePath(res.file?.imagePath || '');
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!analysis) return setError('No analysis to save');
    setLoading(true);
    setError('');
    try {
      await api.createMeal({
        foodName: analysis.foodName || 'Image meal',
        barcode: '',
        quantity: 1,
        calories: Number(analysis.calories) || 0,
        protein: Number(analysis.protein) || 0,
        fats: Number(analysis.fats) || 0,
        carbs: Number(analysis.carbs) || 0,
        imagePath,
        mealType: 'snack',
        servingUnit: 'g',
        servingSize: 100,
        source: 'image'
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <h1>Upload meal photo</h1>
        <p>Upload a photo of your meal — AI will estimate calories and macros.</p>
        <input type="file" accept="image/*" onChange={handleFile} />
        {preview ? <img src={preview} alt="preview" style={{ maxWidth: 320, marginTop: 12, borderRadius: 8 }} /> : null}
        <div style={{ marginTop: 12 }}>
          <button className="button button-primary" onClick={handleAnalyze} disabled={loading || !file}>
            {loading ? 'Analyzing...' : 'Analyze photo'}
          </button>
        </div>
        {error ? <div className="error-box">{error}</div> : null}
      </section>

      {analysis ? (
        <section className="panel">
          <h2>Analysis</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <strong>Calories</strong>
              <div>{analysis.calories} kcal</div>
            </div>
            <div className="summary-card">
              <strong>Protein</strong>
              <div>{analysis.protein} g</div>
            </div>
            <div className="summary-card">
              <strong>Fat</strong>
              <div>{analysis.fats} g</div>
            </div>
            <div className="summary-card">
              <strong>Carbs</strong>
              <div>{analysis.carbs} g</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="button button-secondary" onClick={() => { setAnalysis(null); setImagePath(''); setPreview(null); setFile(null); }}>Reset</button>
            <button className="button button-primary" onClick={handleSave} style={{ marginLeft: 8 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save to today'}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default PhotoMealPage;
