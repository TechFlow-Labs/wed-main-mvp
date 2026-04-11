import { getApiBaseUrl } from './apiConfig';

/** OpenAPI components/schemas/UserProfileResponseSchema */
export type UserProfileResponse = {
  id: string;
  role: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  category: string | null;
  description: string | null;
};

/** OpenAPI components/schemas/UserProfileUpdateSchema */
export type UserProfileUpdate = {
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  business_name?: string | null;
  category?: string | null;
  description?: string | null;
};

function parseApiError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as { detail?: string | { msg?: string }[] };
    if (typeof parsed.detail === 'string') return parsed.detail;
    if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) {
      return parsed.detail.map((d) => d.msg).join(', ');
    }
  } catch {
    /* ignore */
  }
  return `Αποτυχία (${status})`;
}

function authHeaders(accessToken: string, tokenType: string): HeadersInit {
  return {
    Accept: 'application/json',
    Authorization: `${tokenType} ${accessToken}`,
  };
}

/** GET /users/me */
export async function getMyProfile(
  accessToken: string,
  tokenType: string
): Promise<UserProfileResponse> {
  const res = await fetch(`${getApiBaseUrl()}/users/me`, {
    method: 'GET',
    headers: authHeaders(accessToken, tokenType),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiError(res.status, text));
  if (!text) throw new Error('Κενή απάντηση.');
  return JSON.parse(text) as UserProfileResponse;
}

/** PATCH /users/me */
export async function updateMyProfile(
  accessToken: string,
  tokenType: string,
  body: UserProfileUpdate
): Promise<UserProfileResponse> {
  const res = await fetch(`${getApiBaseUrl()}/users/me`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(accessToken, tokenType),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiError(res.status, text));
  if (!text) throw new Error('Κενή απάντηση.');
  return JSON.parse(text) as UserProfileResponse;
}
