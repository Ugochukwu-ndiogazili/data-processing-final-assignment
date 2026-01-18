import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AppLayout from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/Home';
import { ProfilesPage } from './pages/Profiles';
import { BrowsePage } from './pages/Browse';
import { WatchlistPage } from './pages/Watchlist';
import { HistoryPage } from './pages/History';
import { SubscriptionsPage } from './pages/Subscriptions';
import { AdminPage } from './pages/Admin';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { VerifyPage } from './pages/auth/Verify';
import { ForgotPasswordPage } from './pages/auth/ForgotPassword';
import { ResetPasswordPage } from './pages/auth/ResetPassword';

function App() {
  const internalEnabled = import.meta.env.VITE_INTERNAL_API_ENABLED === 'true';
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        {internalEnabled && <Route path="/admin" element={<AdminPage />} />}
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
