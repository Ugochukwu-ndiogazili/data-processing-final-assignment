import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';

const ageOptions = [
  { label: 'Kids', value: 'KIDS' },
  { label: 'Teen', value: 'TEEN' },
  { label: 'Adult', value: 'ADULT' },
];

export function ProfileList() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', ageCategory: 'KIDS' });
  const selectProfile = useAuthStore((state) => state.selectProfile);
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: profileApi.list,
  });

  const createProfile = useMutation({
    mutationFn: profileApi.create,
    onSuccess: () => {
      setForm({ name: '', ageCategory: 'KIDS' });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  const deleteProfile = useMutation({
    mutationFn: profileApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    createProfile.mutate(form);
  };

  if (isLoading) {
    return <Loader label="Loading profiles..." />;
  }

  return (
    <div className="grid" style={{ gap: '1.5rem' }}>
      <section className="panel">
        <h3 style={{ marginBottom: '1rem' }}>Profiles</h3>
        {profiles.length === 0 ? (
          <EmptyState
            title="No profiles yet"
            description="Create individual profiles for each household member."
          />
        ) : (
          <div className="grid grid--two">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="panel"
                style={{
                  border:
                    selectedProfileId === profile.id
                      ? '1px solid rgba(59, 130, 246, 0.8)'
                      : '1px solid rgba(148, 163, 184, 0.2)',
                  background: selectedProfileId === profile.id ? 'rgba(37, 99, 235, 0.08)' : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{profile.name}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{profile.ageCategory}</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => selectProfile(profile.id)}>
                    Use
                  </button>
                </div>
                <button
                  onClick={() => deleteProfile.mutate(profile.id)}
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h3 style={{ marginBottom: '1rem' }}>Create profile</h3>
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <label className="form-field">
            <span>Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Jamie"
              required
            />
          </label>
          <label className="form-field">
            <span>Age category</span>
            <select
              value={form.ageCategory}
              onChange={(e) => setForm((prev) => ({ ...prev, ageCategory: e.target.value }))}
            >
              {ageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button className="btn" type="submit" disabled={createProfile.isPending}>
            {createProfile.isPending ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </section>
    </div>
  );
}

