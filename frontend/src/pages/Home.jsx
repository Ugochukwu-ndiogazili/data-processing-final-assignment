import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSelectedProfile } from '../hooks/useSelectedProfile';
import { PageHeader } from '../components/PageHeader';
import { NowWatching } from '../features/player/NowWatching';
import { contentApi } from '../api/resources';

export function HomePage() {
  const account = useAuthStore((state) => state.account);
  const { profile } = useSelectedProfile();

  const { data: featured = [] } = useQuery({
    queryKey: ['home-featured'],
    queryFn: () => contentApi.list({ type: 'SERIES' }),
  });

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <PageHeader
        title="Dashboard"
        subtitle={
          account?.trialEndsAt
            ? `Trial ends ${dayjs(account.trialEndsAt).format('MMM D, YYYY')}`
            : 'Active member'
        }
        actions={
          <Link to="/browse" className="btn">
            Browse titles
          </Link>
        }
      />

      <div className="grid grid--two">
        <section className="panel">
          <h3>Account snapshot</h3>
          <p>Status: {account?.status}</p>
          <p>Plan: {account?.subscription?.plan || 'No plan selected'}</p>
          <p>Trial ends: {account?.trialEndsAt ? dayjs(account.trialEndsAt).format('MMM D, YYYY') : '—'}</p>
        </section>
        <section className="panel">
          <h3>Active profile</h3>
          <p>Name: {profile?.name || 'Select a profile'}</p>
          <p>Age category: {profile?.ageCategory || '—'}</p>
          <p>Preferences: {profile?.preferences?.genres?.join(', ') || 'None set'}</p>
          <Link to="/profiles" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Manage profiles
          </Link>
        </section>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Continue watching</h3>
          <Link to="/history" className="text-link">
            View history
          </Link>
        </div>
        <NowWatching />
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Featured series</h3>
          <Link to="/browse" className="text-link">
            See all titles
          </Link>
        </div>
        <div className="grid grid--two" style={{ marginTop: '1rem' }}>
          {featured.slice(0, 4).map((title) => (
            <article key={title.id} className="panel">
              <p className="badge">{title.type}</p>
              <h4 style={{ margin: '0.4rem 0' }}>{title.name}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{title.synopsis}</p>
            </article>
          ))}
          {!featured.length && <p style={{ color: '#94a3b8' }}>No featured titles yet.</p>}
        </div>
      </section>
    </div>
  );
}




