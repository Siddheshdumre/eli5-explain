// Backend base URL. Empty (default) = same origin, which works with the Vite dev proxy,
// Nginx in Docker, and Vercel. Set VITE_API_URL when the backend is on another domain (e.g. Render).
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export const apiUrl = (path: string) => `${API_BASE}${path}`;
