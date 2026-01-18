import { apiClient } from './client';

export const authApi = {
  login: (payload) => apiClient.post('/auth/login', payload).then((res) => res.data),
  register: (payload) => apiClient.post('/auth/register', payload).then((res) => res.data),
  verify: (payload) => apiClient.post('/auth/verify', payload).then((res) => res.data),
  forgot: (payload) => apiClient.post('/auth/forgot-password', payload).then((res) => res.data),
  reset: (payload) => apiClient.post('/auth/reset-password', payload).then((res) => res.data),
};

export const profileApi = {
  list: () => apiClient.get('/profiles').then((res) => res.data),
  create: (payload) => apiClient.post('/profiles', payload).then((res) => res.data),
  update: (id, payload) => apiClient.patch(`/profiles/${id}`, payload).then((res) => res.data),
  remove: (id) => apiClient.delete(`/profiles/${id}`),
  watchlist: (profileId) => apiClient.get(`/profiles/${profileId}/watchlist`).then((res) => res.data),
  addToWatchlist: (profileId, titleId) =>
    apiClient.post(`/profiles/${profileId}/watchlist`, { titleId }).then((res) => res.data),
  removeFromWatchlist: (profileId, titleId) =>
    apiClient.delete(`/profiles/${profileId}/watchlist/${titleId}`),
  history: (profileId) => apiClient.get(`/profiles/${profileId}/history`).then((res) => res.data),
};

export const contentApi = {
  list: (params) => apiClient.get('/content/titles', { params }).then((res) => res.data),
  detail: (slug) => apiClient.get(`/content/titles/${slug}`).then((res) => res.data),
  guidelines: () => apiClient.get('/content/guidelines').then((res) => res.data),
};

export const viewingApi = {
  start: (payload) => apiClient.post('/viewing/start', payload).then((res) => res.data),
  progress: (payload) => apiClient.post('/viewing/progress', payload).then((res) => res.data),
  inProgress: (profileId) => apiClient.get(`/viewing/profiles/${profileId}/in-progress`).then((res) => res.data),
  completed: (profileId) => apiClient.get(`/viewing/profiles/${profileId}/completed`).then((res) => res.data),
};

export const subscriptionApi = {
  plans: () => apiClient.get('/subscriptions/plans').then((res) => res.data),
  current: () => apiClient.get('/subscriptions/me').then((res) => res.data),
  changePlan: (planCode) => apiClient.post('/subscriptions/change-plan', { planCode }).then((res) => res.data),
  invite: (email) => apiClient.post('/subscriptions/invite', { email }).then((res) => res.data),
  acceptInvite: (token) => apiClient.post('/subscriptions/accept', { token }).then((res) => res.data),
  discounts: () => apiClient.get('/subscriptions/discounts').then((res) => res.data),
};

export const internalApi = {
  accounts: (config) => apiClient.get('/internal/accounts', config).then((res) => res.data),
  viewing: (config) => apiClient.get('/internal/viewing-history', config).then((res) => res.data),
};

