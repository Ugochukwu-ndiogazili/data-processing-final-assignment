import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contentApi, profileApi, viewingApi } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { useAuthStore } from '../../store/authStore';

const guidelineOptions = [
  { value: 'VIOLENCE', label: 'Violence' },
  { value: 'FEAR', label: 'Fear' },
  { value: 'COARSE_LANGUAGE', label: 'Coarse language' },
];

export function ContentLibrary() {
  const queryClient = useQueryClient();
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    guideline: '',
  });

  const { data: titles = [], isLoading } = useQuery({
    queryKey: ['titles', filters, selectedProfileId],
    queryFn: () => contentApi.list({ ...filters, profileId: selectedProfileId }),
  });

  const addToWatchlist = useMutation({
    mutationFn: (titleId) => profileApi.addToWatchlist(selectedProfileId, titleId),
    onSuccess: () => {
      if (selectedProfileId) {
        queryClient.invalidateQueries({ queryKey: ['watchlist', selectedProfileId] });
      }
    },
  });

  const startViewing = useMutation({
    mutationFn: (titleId) => viewingApi.start({ profileId: selectedProfileId, titleId }),
    onSuccess: () => {
      if (selectedProfileId) {
        queryClient.invalidateQueries({ queryKey: ['in-progress', selectedProfileId] });
      }
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="panel">
      <form
        className="grid"
        style={{ gap: '1rem', marginBottom: '1.5rem' }}
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          name="search"
          placeholder="Search titles..."
          value={filters.search}
          onChange={handleChange}
          style={{ borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(148,163,184,0.3)' }}
        />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select name="type" value={filters.type} onChange={handleChange}>
            <option value="">Type</option>
            <option value="FILM">Film</option>
            <option value="SERIES">Series</option>
          </select>
          <select name="guideline" value={filters.guideline} onChange={handleChange}>
            <option value="">Guideline</option>
            {guidelineOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {isLoading ? (
        <Loader label="Loading titles..." />
      ) : (
        <div className="grid grid--two">
          {titles.map((title) => (
            <article key={title.id} className="panel" style={{ background: 'rgba(15,23,42,0.5)' }}>
              <p className="badge" style={{ marginBottom: '0.6rem' }}>
                {title.type}
              </p>
              <h4 style={{ margin: '0 0 0.5rem' }}>{title.name}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', minHeight: '3em' }}>{title.synopsis}</p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#cbd5f5' }}>
                <strong>Qualities:</strong> {title.availableQualities?.join(', ') || 'SD'}
              </div>
              <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: '#cbd5f5' }}>
                <strong>Guidelines:</strong> {title.guidelineFlags?.join(', ') || 'None'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary"
                  type="button"
                  disabled={!selectedProfileId || addToWatchlist.isPending}
                  onClick={() => selectedProfileId && addToWatchlist.mutate(title.id)}
                >
                  {addToWatchlist.isPending ? 'Saving...' : 'Add to watchlist'}
                </button>
                <button
                  className="btn"
                  type="button"
                  disabled={!selectedProfileId || startViewing.isPending}
                  onClick={() => selectedProfileId && startViewing.mutate(title.id)}
                >
                  {startViewing.isPending ? 'Starting...' : 'Start session'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

