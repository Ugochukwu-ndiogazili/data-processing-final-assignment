import { describe, expect, it, beforeEach } from 'vitest';
import { authStore } from '../store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    authStore.setState({
      account: null,
      accessToken: null,
      refreshToken: null,
      selectedProfileId: null,
    });
  });

  it('stores tokens when setAuth is called', () => {
    const payload = {
      account: { id: 'acc1', email: 'demo@test.dev' },
      tokens: { accessToken: 'access', refreshToken: 'refresh' },
    };

    authStore.getState().setAuth(payload);

    expect(authStore.getState().account).toEqual(payload.account);
    expect(authStore.getState().accessToken).toBe('access');
    expect(authStore.getState().refreshToken).toBe('refresh');
  });

  it('clears state when clearAuth is called', () => {
    authStore.setState({
      account: { id: 'acc1' },
      accessToken: 'token',
      refreshToken: 'refresh',
      selectedProfileId: 'profile',
    });

    authStore.getState().clearAuth();

    expect(authStore.getState().account).toBeNull();
    expect(authStore.getState().accessToken).toBeNull();
    expect(authStore.getState().refreshToken).toBeNull();
    expect(authStore.getState().selectedProfileId).toBeNull();
  });
});




