import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Access Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle Refresh Token or Authorization Errors
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res: any = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
          if (res.data?.success && res.data?.data?.access_token) {
            localStorage.setItem('access_token', res.data.data.access_token);
            localStorage.setItem('refresh_token', res.data.data.refresh_token);
            axiosClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.access_token}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
