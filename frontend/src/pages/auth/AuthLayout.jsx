import { Link } from 'react-router-dom';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  cta = { label: 'Create account', href: '/register' },
}) {
  return (
    <div className="auth-page">
      <div className="panel auth-card">
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.35rem' }}>{title}</h1>
          {subtitle && <p style={{ color: '#94a3b8' }}>{subtitle}</p>}
        </header>
        <div style={{ display: 'grid', gap: '1rem' }}>{children}</div>
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
      <div className="auth-side-note">
        <h2>StreamFlix</h2>
        <p>Profiles, watchlists, and viewing progress — all aligned with age filters and preferences.</p>
        <Link to={cta.href} className="btn" style={{ width: 'fit-content' }}>
          {cta.label}
        </Link>
      </div>
    </div>
  );
}

