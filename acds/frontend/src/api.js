// Central API configuration
// On Vercel: set VITE_API_URL to your deployed backend URL (e.g. https://your-backend.railway.app)
// Locally: defaults to http://localhost:8000
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https:' : 'http:';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `${protocol}//${hostname}:8000`;
};

const getWsBase = () => {
  const apiBase = getApiBase();
  return apiBase.replace(/^https/, 'wss').replace(/^http/, 'ws');
};

const API_BASE = getApiBase();
const WS_BASE  = getWsBase();

export { API_BASE, WS_BASE };
