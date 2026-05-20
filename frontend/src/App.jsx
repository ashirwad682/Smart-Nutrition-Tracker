import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AddMealPage from './pages/AddMealPage';
import BarcodeScannerPage from './pages/BarcodeScannerPage';
import DashboardPage from './pages/DashboardPage';
import FoodSearchPage from './pages/FoodSearchPage';
import HistoryPage from './pages/MealHistoryPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="search" element={<FoodSearchPage />} />
      <Route path="scanner" element={<BarcodeScannerPage />} />
      <Route path="add-meal" element={<AddMealPage />} />
      <Route path="history" element={<HistoryPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
