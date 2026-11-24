import axios from 'axios';

export const PASSWORD_CHANGE_REQUIRED = 'PASSWORD_CHANGE_REQUIRED';

export const defaultAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const axiosRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Обработчик подключает store (импортировать store прямо здесь нельзя — круговая зависимость)
let onPasswordChangeRequired = null;
export const setPasswordChangeHandler = (handler) => {
  onPasswordChangeRequired = handler;
};

axiosRequest.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// При responseType: 'blob' тело ошибки тоже приходит как Blob — приводим его к обычному {"detail": "…"}
const unwrapBlobError = async (error) => {
  const data = error.response?.data;
  if (!(data instanceof Blob)) return;
  try {
    error.response.data = JSON.parse(await data.text());
  } catch {
    error.response.data = null;
  }
};

axiosRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // BASE_URL учитывает базовый путь сборки (например /admin/ в build:admin)
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    await unwrapBlobError(error);
    if (error.response?.status === 403 && error.response.data?.detail === PASSWORD_CHANGE_REQUIRED) {
      onPasswordChangeRequired?.();
    }
    return Promise.reject(error);
  }
);
