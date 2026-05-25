import axios from 'axios';
import { getCSRFToken } from '../utils/csrfToken';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT y CSRF
axiosInstance.interceptors.request.use(
  async (config) => {
    // Agregar JWT
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar CSRF token en peticiones que modifican datos
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      const csrfToken = await getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Si el CSRF token es inválido, obtener uno nuevo
    if (error.response?.status === 403 && error.response?.data?.message === 'Token CSRF inválido o expirado') {
      localStorage.removeItem('csrf_token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
