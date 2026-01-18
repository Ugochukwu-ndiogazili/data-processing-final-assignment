export function Loader({ label = 'Loading...' }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
      <span className="badge">{label}</span>
    </div>
  );
}

