import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const authStore = create(
  persist(
    (set) => ({
      account: null,
      accessToken: null,
      refreshToken: null,
      selectedProfileId: null,
      setAuth: (payload) =>
        set(() => ({
          account: payload.account,
          accessToken: payload.tokens.accessToken,
          refreshToken: payload.tokens.refreshToken,
        })),
      clearAuth: () =>
        set(() => ({
          account: null,
          accessToken: null,
          refreshToken: null,
          selectedProfileId: null,
        })),
      selectProfile: (profileId) => set(() => ({ selectedProfileId: profileId })),
      updateAccount: (account) => set(() => ({ account })),
    }),
    {
      name: 'streamflix-auth',
      partialize: (state) => ({
        account: state.account,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        selectedProfileId: state.selectedProfileId,
      }),
    }
  )
);

export const useAuthStore = authStore;

