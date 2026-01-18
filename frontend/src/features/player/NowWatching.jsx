import { useQuery } from '@tanstack/react-query';
import { viewingApi } from '../../api/resources';
import { useAuthStore } from '../../store/authStore';
import { EmptyState } from '../../components/EmptyState';
import { Loader } from '../../components/Loader';

export function NowWatching() {
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['in-progress', selectedProfileId],
    queryFn: () => viewingApi.inProgress(selectedProfileId),
    enabled: Boolean(selectedProfileId),
  });

  if (!selectedProfileId) {
    return (
      <EmptyState
        title="Select a profile"
        description="Choose a profile to see personalised progress."
      />
    );
  }

  if (isLoading) {
    return <Loader label="Loading viewing data..." />;
  }

  if (!events.length) {
    return (
      <EmptyState
        title="No sessions in progress"
        description="Start watching any title and progress will appear here."
      />
    );
  }

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      {events.map((event) => (
        <article key={event.id} className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="badge">{event.title?.type || 'TITLE'}</p>
            {event.episode && (
              <span style={{ fontSize: '0.8rem', color: '#cbd5f5' }}>Episode {event.episode.number}</span>
            )}
          </div>
          <h4 style={{ margin: '0.35rem 0' }}>{event.title?.name}</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Watched {event.durationWatched} sec • Last position {event.lastPosition}s
          </p>
        </article>
      ))}
    </div>
  );
}

