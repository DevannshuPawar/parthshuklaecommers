import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopkartToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shopkartToken');
      localStorage.removeItem('shopkartUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
