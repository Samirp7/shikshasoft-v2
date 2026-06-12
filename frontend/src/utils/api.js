import axios from 'axios';

// Create the axios instance pointing to your backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Automatically injects the Supabase JWT token into every request
api.interceptors.request.use(
  (config) => {
    // 1. Find the local storage key Supabase uses to track your session
    const supabaseKey = Object.keys(localStorage).find((key) =>
      key.startsWith('sb-') && key.endsWith('-auth-token')
    );

    if (supabaseKey) {
      try {
        const sessionData = JSON.parse(localStorage.getItem(supabaseKey));
        const token = sessionData?.access_token;
        
        // 2. Inject the live token into the Authorization Header
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing Supabase session token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Handles errors safely WITHOUT forcing a blind window.location redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server rejects the request with a 401 Unauthorized error
    if (error.response && error.response.status === 401) {
      console.warn('API returned 401 Unauthorized. Session may be expired.');
      
      // DO NOT use window.location.href = '/login' here!
      // React Router guards in App.jsx will handle navigation gracefully if the session drops.
    }
    return Promise.reject(error);
  }
);

export default api;
