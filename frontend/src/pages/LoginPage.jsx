import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel hero-panel">
        <p className="eyebrow">Smart Nutrition Tracker</p>
        <h1>Log meals faster than ever.</h1>
        <p>
          Scan a barcode or search by name, then store calories, protein, fats, and carbs in your own dashboard.
        </p>
        <div className="feature-chip-row">
          <span>Barcode scan</span>
          <span>USDA search</span>
          <span>Meal history</span>
        </div>
      </section>

      <section className="auth-panel form-panel">
        <h2>Welcome back</h2>
        <p>Sign in to view today’s totals and meal history.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Need an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </div>
  );
};

export default LoginPage;
