import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Loader } from '../components/Loader';
import { profileApi } from '../api/resources';
import { useAuthStore } from '../store/authStore';
import { useSelectedProfile } from '../hooks/useSelectedProfile';

export function HistoryPage() {
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);
  const { profile } = useSelectedProfile();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['history', selectedProfileId],
    queryFn: () => profileApi.history(selectedProfileId),
    enabled: Boolean(selectedProfileId),
  });

  let content;
  if (!selectedProfileId) {
    content = (
      <EmptyState
        title="Select a profile"
        description="Pick a profile to review recent viewing."
        action={
          <Link to="/profiles" className="btn">
            Choose profile
          </Link>
        }
      />
    );
  } else if (isLoading) {
    content = <Loader label="Loading viewing history..." />;
  } else if (!events.length) {
    content = (
      <EmptyState
        title="No viewing history"
        description="Watch a title to collect progress."
        action={
          <Link to="/browse" className="btn">
            Browse titles
          </Link>
        }
      />
    );
  } else {
    content = (
      <div className="grid" style={{ gap: '1rem' }}>
        {events.map((event) => (
          <article key={event.id} className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="badge">{event.completed ? 'Completed' : 'In progress'}</p>
              <span style={{ color: '#cbd5f5', fontSize: '0.85rem' }}>
                {new Date(event.startedAt).toLocaleString()}
              </span>
            </div>
            <h4 style={{ margin: '0.4rem 0' }}>{event.title?.name}</h4>
            {event.episode && (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Episode {event.episode.number}: {event.episode.name}
              </p>
            )}
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Watched {event.durationWatched} seconds • Last position {event.lastPosition}s
            </p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <PageHeader
        title="Viewing history"
        subtitle={profile ? `${profile.name}'s last 50 sessions` : 'Pick a profile to continue'}
      />
      {content}
    </div>
  );
}




