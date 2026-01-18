import axios from 'axios';
import { authStore } from '../store/authStore';

const configuredUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
const baseURL = configuredUrl.replace('http://localhost:5000', 'http://127.0.0.1:5000');

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = authStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setAuth, clearAuth } = authStore.getState();
      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        setAuth(data);
        originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuth();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

