import { Fragment } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSelectedProfile } from '../hooks/useSelectedProfile';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/profiles', label: 'Profiles', icon: '👥' },
  { to: '/browse', label: 'Browse', icon: '🎬' },
  { to: '/watchlist', label: 'Watchlist', icon: '⭐' },
  { to: '/history', label: 'History', icon: '⏱' },
  { to: '/subscriptions', label: 'Subscriptions', icon: '💳' },
  { to: '/admin', label: 'Admin', icon: '🛠' },
];
const internalEnabled = import.meta.env.VITE_INTERNAL_API_ENABLED === 'true';

// Stable selector functions to avoid infinite loops with React 19
const selectAccount = (state) => state.account;
const selectClearAuth = (state) => state.clearAuth;

function AppLayout() {
  const account = useAuthStore(selectAccount);
  const clearAuth = useAuthStore(selectClearAuth);
  const navigate = useNavigate();
  const { profile } = useSelectedProfile();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.25rem' }}>StreamFlix</h2>
          {account && (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {account.email} {account.subscription?.plan && `· ${account.subscription.plan}`}
            </p>
          )}
          <p style={{ color: '#cbd5f5', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Active profile: {profile ? profile.name : 'None selected'}
          </p>
        </div>
        <nav style={{ display: 'grid', gap: '0.35rem' }}>
          {navItems
            .filter((link) => (link.to === '/admin' ? internalEnabled : true))
            .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={link.to === '/'}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn btn-secondary" style={{ marginTop: 'auto' }} onClick={handleLogout}>
          Log out
        </button>
      </aside>
      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

