// Central API configuration
// On Vercel: set VITE_API_URL to your deployed backend URL (e.g. https://your-backend.railway.app)
// Locally: defaults to http://localhost:8000
const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;
const WS_BASE  = (import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`)
  .replace(/^https/, 'wss')
  .replace(/^http/, 'ws');

export { API_BASE, WS_BASE };
