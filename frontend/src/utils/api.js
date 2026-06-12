import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic token injection
api.interceptors.request.use(
  (config) => {
    const supabaseKey = Object.keys(localStorage).find((key) =>
      key.startsWith('sb-') && key.endsWith('-auth-token')
    );

    if (supabaseKey) {
      try {
        const sessionData = JSON.parse(localStorage.getItem(supabaseKey));
        const token = sessionData?.access_token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Token parse error:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Safe response interceptor without the loop trigger
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - handoff to App routing handles this.');
    }
    return Promise.reject(error);
  }
);

export default api;
