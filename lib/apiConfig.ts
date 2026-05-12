/**
 * Base URL for the Wedding Plan API (OpenAPI server).
 * Override with EXPO_PUBLIC_API_URL (e.g. http://192.168.1.10:8060 for a physical device).
 */
export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8060';
  return raw.replace(/\/+$/, '');
}

/**
 * Optional origin for the public SSR site (no trailing slash).
 * Used to deep-link to generated wedding pages, e.g. https://ssr.example.com + /w/my-slug
 */
export function getPublicWebBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_PUBLIC_WEB_URL ?? '';
  return raw.replace(/\/+$/, '');
}
