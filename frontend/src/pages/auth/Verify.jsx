import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/resources';
import { AuthLayout } from './AuthLayout';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('token')) {
      setToken(searchParams.get('token'));
    }
  }, [searchParams]);

  const verify = useMutation({
    mutationFn: authApi.verify,
    onSuccess: (data) => {
      setError('');
      setStatus(data.message || 'Account verified! You may log in.');
    },
    onError: (err) => {
      setStatus('');
      setError(err.response?.data?.message || 'Token invalid or expired.');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('');
    verify.mutate({ token });
  };

  return (
    <AuthLayout
      title="Verify your account"
      subtitle="Paste the token from your email"
      cta={{ label: 'Back to login', href: '/login' }}
      footer={
        <p>
          Need a new link? <Link to="/register">Register again</Link> or{' '}
          <Link to="/login">log in</Link>.
        </p>
      }
    >
      <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Verification token</span>
          <input value={token} onChange={(e) => setToken(e.target.value)} required />
        </label>
        <button className="btn" type="submit" disabled={verify.isPending}>
          {verify.isPending ? 'Verifying...' : 'Verify account'}
        </button>
        {status && <p style={{ color: '#4ade80' }}>{status}</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
      </form>
    </AuthLayout>
  );
}

