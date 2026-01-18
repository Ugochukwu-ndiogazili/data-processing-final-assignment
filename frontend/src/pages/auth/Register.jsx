import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/resources';
import { AuthLayout } from './AuthLayout';

export function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setError('');
      const tokenNote = data?.verificationToken
        ? ` Verification token: ${data.verificationToken}`
        : '';
      setMessage(`Check your inbox for the verification link.${tokenNote}`);
      setTimeout(() => navigate('/login'), 2500);
    },
    onError: (err) => {
      setMessage('');
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');
    register.mutate(form);
  };

  return (
    <AuthLayout
      title="Create a StreamFlix account"
      subtitle="Seven-day trial included"
      cta={{ label: 'Back to login', href: '/login' }}
      footer={
        <p>
          Already registered? <Link to="/login">Sign in here</Link>
        </p>
      }
    >
      <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email address</span>
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
            minLength={8}
            required
          />
        </label>
        <button className="btn" type="submit" disabled={register.isPending}>
          {register.isPending ? 'Creating account...' : 'Create account'}
        </button>
        {message && <p style={{ color: '#4ade80' }}>{message}</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
      </form>
    </AuthLayout>
  );
}

