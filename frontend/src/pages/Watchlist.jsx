import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Loader } from '../components/Loader';
import { profileApi } from '../api/resources';
import { useAuthStore } from '../store/authStore';
import { useSelectedProfile } from '../hooks/useSelectedProfile';

export function WatchlistPage() {
  const queryClient = useQueryClient();
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);
  const { profile } = useSelectedProfile();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['watchlist', selectedProfileId],
    queryFn: () => profileApi.watchlist(selectedProfileId),
    enabled: Boolean(selectedProfileId),
  });

  const removeItem = useMutation({
    mutationFn: (titleId) => profileApi.removeFromWatchlist(selectedProfileId, titleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist', selectedProfileId] }),
  });

  let content;
  if (!selectedProfileId) {
    content = (
      <EmptyState
        title="Select a profile"
        description="Pick a profile to see its personalised watchlist."
        action={
          <Link to="/profiles" className="btn">
            Choose profile
          </Link>
        }
      />
    );
  } else if (isLoading) {
    content = <Loader label="Loading watchlist..." />;
  } else if (!items.length) {
    content = (
      <EmptyState
        title="Watchlist is empty"
        description="Add titles from the Browse page."
        action={
          <Link to="/browse" className="btn">
            Browse titles
          </Link>
        }
      />
    );
  } else {
    content = (
      <div className="grid grid--two">
        {items.map((item) => (
          <article key={item.id} className="panel">
            <p className="badge">{item.title.type}</p>
            <h4>{item.title.name}</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{item.title.synopsis}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span style={{ color: '#cbd5f5', fontSize: '0.85rem' }}>
                Added {new Date(item.addedAt).toLocaleDateString()}
              </span>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => removeItem.mutate(item.titleId)}
                disabled={removeItem.isPending}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <PageHeader
        title="Watchlist"
        subtitle={
          profile
            ? `${profile.name}'s saved titles`
            : 'Choose a profile to explore saved titles'
        }
        actions={
          <Link to="/browse" className="btn">
            Add more titles
          </Link>
        }
      />
      {content}
    </div>
  );
}




