import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('bite-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.me();
        setUser(response.user);
      } catch (error) {
        localStorage.removeItem('bite-token');
        localStorage.removeItem('bite-user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [token]);

  const persist = (nextToken, nextUser) => {
    localStorage.setItem('bite-token', nextToken);
    localStorage.setItem('bite-user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (payload) => {
    const response = await api.login(payload);
    persist(response.token, response.user);
    return response;
  };

  const register = async (payload) => {
    const response = await api.register(payload);
    persist(response.token, response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('bite-token');
    localStorage.removeItem('bite-user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
