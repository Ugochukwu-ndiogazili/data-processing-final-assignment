import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/resources';
import { AuthLayout } from './AuthLayout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const requestReset = useMutation({
    mutationFn: authApi.forgot,
    onSuccess: (data) => {
      setError('');
      setStatus(data.message || 'Check your inbox for reset instructions.');
    },
    onError: (err) => {
      setStatus('');
      setError(err.response?.data?.message || 'Unable to send reset link.');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('');
    requestReset.mutate({ email });
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="We'll send a reset link to your email"
      cta={{ label: 'Back to login', href: '/login' }}
      footer={
        <p>
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      }
    >
      <form className="grid" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email address</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn" type="submit" disabled={requestReset.isPending}>
          {requestReset.isPending ? 'Sending...' : 'Send reset link'}
        </button>
        {status && <p style={{ color: '#4ade80' }}>{status}</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
      </form>
    </AuthLayout>
  );
}

