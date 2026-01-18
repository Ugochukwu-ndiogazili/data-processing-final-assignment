import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/resources';
import { AuthLayout } from './AuthLayout';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ token: '', password: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setForm((prev) => ({ ...prev, token: tokenFromUrl }));
    }
  }, [searchParams]);

  const resetPassword = useMutation({
    mutationFn: authApi.reset,
    onSuccess: (data) => {
      setError('');
      setStatus(data.message || 'Password updated. You may log in now.');
    },
    onError: (err) => {
      setStatus('');
      setError(err.response?.data?.message || 'Unable to reset password.');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('');
    resetPassword.mutate(form);
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Choose a new secure password"
      cta={{ label: 'Back to login', href: '/login' }}
      footer={
        <p>
          Back to <Link to="/login">sign in</Link>
        </p>
      }
    >
      <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Reset token</span>
          <input value={form.token} onChange={(e) => setForm((prev) => ({ ...prev, token: e.target.value }))} required />
        </label>
        <label className="form-field">
          <span>New password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            minLength={8}
            required
          />
        </label>
        <button className="btn" type="submit" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? 'Updating...' : 'Update password'}
        </button>
        {status && <p style={{ color: '#4ade80' }}>{status}</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
      </form>
    </AuthLayout>
  );
}

