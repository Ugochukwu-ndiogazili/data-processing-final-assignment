import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/resources';

// Stable selector function to avoid infinite loops with React 19
const selectSelectedProfileId = (state) => state.selectedProfileId;

export function useSelectedProfile() {
  const selectedProfileId = useAuthStore(selectSelectedProfileId);

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: profileApi.list,
  });

  const profile = useMemo(
    () => profiles.find((item) => item.id === selectedProfileId),
    [profiles, selectedProfileId]
  );

  return useMemo(
    () => ({
      profiles,
      profile,
      selectedProfileId,
    }),
    [profiles, profile, selectedProfileId]
  );
}

