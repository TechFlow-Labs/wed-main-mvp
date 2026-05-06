/**
 * Base URL for the Wedding Plan API (OpenAPI server).
 * - Docker / production web: use `/api` so Nginx proxies same-origin (avoids CORS).
 * - Local dev: `http://localhost:8060` or your LAN IP for devices.
 * - Override anytime with EXPO_PUBLIC_API_URL.
 */
export function getApiBaseUrl(): string {
  const fallback =
    process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8060';
  const raw = process.env.EXPO_PUBLIC_API_URL ?? fallback;
  return raw.replace(/\/$/, '');
}
