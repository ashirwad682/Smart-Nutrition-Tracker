import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">BITE</span>
          <span className="brand-copy">Smart Nutrition Tracker</span>
        </Link>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Food Search
          </NavLink>
          <NavLink to="/scanner" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Barcode Scanner
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Meal History
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>
            <p className="sidebar-label">Signed in as</p>
            <strong>{user?.name || 'User'}</strong>
          </div>
          <button className="button button-secondary" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
