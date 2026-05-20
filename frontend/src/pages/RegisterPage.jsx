import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    weight: '',
    goal: 'Maintain weight'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel hero-panel hero-panel-alt">
        <p className="eyebrow">Create your profile</p>
        <h1>Track food around your life, not the other way around.</h1>
        <p>
          Save your profile, log meals quickly, and keep daily nutrition totals tied to your account.
        </p>
      </section>

      <section className="auth-panel form-panel">
        <h2>Create account</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </label>
          <div className="inline-fields">
            <label>
              Age
              <input name="age" type="number" value={form.age} onChange={handleChange} min="0" />
            </label>
            <label>
              Weight
              <input name="weight" type="number" value={form.weight} onChange={handleChange} min="0" />
            </label>
          </div>
          <label>
            Goal
            <select name="goal" value={form.goal} onChange={handleChange}>
              <option>Lose weight</option>
              <option>Maintain weight</option>
              <option>Gain muscle</option>
              <option>Improve endurance</option>
            </select>
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </div>
  );
};

export default RegisterPage;
