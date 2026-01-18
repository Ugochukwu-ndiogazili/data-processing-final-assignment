import { useState } from 'react';
import { internalApi } from '../../api/resources';

export function InternalConsole() {
  const [apiKey, setApiKey] = useState('');
  const [role, setRole] = useState('JUNIOR');
  const [accounts, setAccounts] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const headers = {
    headers: {
      'x-internal-key': apiKey,
      'x-internal-role': role,
    },
  };

  const fetchAccounts = async () => {
    try {
      setError('');
      const data = await internalApi.accounts(headers);
      setAccounts(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const fetchHistory = async () => {
    try {
      setError('');
      const data = await internalApi.viewing(headers);
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <section className="panel">
      <h3 style={{ marginBottom: '1rem' }}>Internal console</h3>
      <div className="grid" style={{ gap: '1rem', marginBottom: '1rem' }}>
        <input placeholder="Internal API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="JUNIOR">Junior</option>
          <option value="MID">Mid</option>
          <option value="SENIOR">Senior</option>
        </select>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" type="button" onClick={fetchAccounts}>
            Load accounts
          </button>
          <button className="btn btn-secondary" type="button" onClick={fetchHistory}>
            Load viewing
          </button>
        </div>
      </div>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <div className="grid" style={{ gap: '1rem' }}>
        {accounts.slice(0, 3).map((account) => (
          <article key={account.id} className="panel">
            <h4>{account.email}</h4>
            <p>Status: {account.status}</p>
            <p>Profiles: {account.profiles?.length ?? 0}</p>
          </article>
        ))}
      </div>
      {role === 'SENIOR' && (
        <div style={{ marginTop: '1rem' }}>
          <h4>Recent viewing</h4>
          <ul>
            {history.slice(0, 5).map((event) => (
              <li key={event.id}>
                {event.account.email} · {event.title.name} ({event.profile.name})
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

