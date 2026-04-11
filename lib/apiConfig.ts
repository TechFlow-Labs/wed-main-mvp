/**
 * Base URL for the Wedding Plan API (OpenAPI server).
 * Override with EXPO_PUBLIC_API_URL (e.g. http://192.168.1.10:8060 for a physical device).
 */
export function getApiBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8060';
  return raw.replace(/\/$/, '');
}
