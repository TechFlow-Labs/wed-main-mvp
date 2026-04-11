import { getApiBaseUrl } from './apiConfig';

/** OpenAPI GuestDashboard */
export type GuestDashboard = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  reservation_id: string | null;
};

/** OpenAPI GuestCreate */
export type GuestCreate = {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone_number?: string | null;
  reservation_id?: string | null;
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

/** GET /guests/ */
export async function getAllGuests(accessToken: string, tokenType: string): Promise<GuestDashboard[]> {
  const res = await fetch(`${getApiBaseUrl()}/guests/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiError(res.status, text));
  if (!text) return [];
  const data = JSON.parse(text) as unknown;
  return Array.isArray(data) ? (data as GuestDashboard[]) : [];
}

/** POST /guests/ */
export async function createGuest(
  accessToken: string,
  tokenType: string,
  body: GuestCreate
): Promise<GuestDashboard> {
  const res = await fetch(`${getApiBaseUrl()}/guests/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
    body: JSON.stringify({
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email?.trim() ? body.email.trim() : null,
      phone_number: body.phone_number?.trim() ? body.phone_number.trim() : null,
      reservation_id: body.reservation_id ?? null,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiError(res.status, text));
  if (!text) throw new Error('Κενή απάντηση από τον διακομιστή.');
  return JSON.parse(text) as GuestDashboard;
}

export function guestsForReservation(
  guests: GuestDashboard[],
  reservationId: string
): GuestDashboard[] {
  const id = reservationId.toLowerCase();
  return guests.filter(
    (g) => g.reservation_id && g.reservation_id.toLowerCase() === id
  );
}
