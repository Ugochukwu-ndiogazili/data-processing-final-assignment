import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { authApi } from '../../api/resources';
import { useAuthStore } from '../../store/authStore';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setError('');
      setAuth(data);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Unable to sign in. Please try again.');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    login.mutate(form);
  };

  return (
    <AuthLayout
      title="Sign in to StreamFlix"
      subtitle="Access personalised profiles and progress"
      footer={
        <p>
          No account yet? <Link to="/register">Create one</Link>
        </p>
      }
    >
      <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </label>
        <button className="btn" type="submit" disabled={login.isPending}>
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </button>
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/forgot-password" className="text-link">
          Forgot password?
        </Link>
        <Link to="/verify" className="text-link">
          Verify account
        </Link>
      </div>
    </AuthLayout>
  );
}

