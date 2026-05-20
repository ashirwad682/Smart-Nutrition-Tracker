const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const readToken = () => localStorage.getItem('bite-token');

const request = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = readToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const api = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/api/auth/me'),
  searchFood: (query) => request(`/api/food/search?query=${encodeURIComponent(query)}`),
  lookupBarcode: (barcode) => request(`/api/food/barcode/${encodeURIComponent(barcode)}`),
  createMeal: (payload) => request('/api/meals', { method: 'POST', body: JSON.stringify(payload) }),
  getTodayMeals: () => request('/api/meals/today'),
  getMealHistory: () => request('/api/meals/history'),
  deleteMeal: (id) => request(`/api/meals/${id}`, { method: 'DELETE' })
};
