export function PageHeader({ title, subtitle, actions }) {
  return (
    <header style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{title}</h1>
          {subtitle && <p style={{ color: '#94a3b8' }}>{subtitle}</p>}
        </div>
        {actions}
      </div>
    </header>
  );
}

