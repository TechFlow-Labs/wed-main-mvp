import { getApiBaseUrl } from './apiConfig';

/** Matches OpenAPI components/schemas/Token */
export type AuthToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
  role: string;
};

type LoginBody = {
  username: string;
  password: string;
};

function parseErrorMessage(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as { detail?: string | { msg?: string }[] };
    if (typeof parsed.detail === 'string') return parsed.detail;
    if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) {
      return parsed.detail.map((d) => d.msg).join(', ');
    }
  } catch {
    /* ignore */
  }
  return status === 401 ? 'Λάθος όνομα χρήστη ή κωδικός.' : `Σφάλμα σύνδεσης (${status}).`;
}

/**
 * POST /auth/login — application/x-www-form-urlencoded (OpenAPI Body_login_auth_login_post).
 */
export async function loginRequest(body: LoginBody): Promise<AuthToken> {
  const url = `${getApiBaseUrl()}/auth/login`;
  const form = new URLSearchParams();
  form.set('username', body.username);
  form.set('password', body.password);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: form.toString(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseErrorMessage(res.status, text));
  }

  const data = JSON.parse(text) as AuthToken;
  if (
    typeof data.access_token !== 'string' ||
    typeof data.token_type !== 'string' ||
    typeof data.expires_in !== 'number' ||
    typeof data.role !== 'string'
  ) {
    throw new Error('Μη έγκυτη απάντηση από τον διακομιστή.');
  }
  return data;
}
