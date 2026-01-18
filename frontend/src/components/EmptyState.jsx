export function EmptyState({ title, description, action }) {
  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{description}</p>
      {action}
    </div>
  );
}

