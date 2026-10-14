import axios from 'axios';

export const defaultAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const axiosRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // BASE_URL учитывает базовый путь сборки (например /admin/ в build:admin)
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    return Promise.reject(error);
  }
);