import { getApiBaseUrl } from './apiConfig';
import type { ReservationsSchema } from './reservationTypes';

/** OpenAPI components/schemas/ReservationsUpdateSchema */
export type ReservationsUpdatePayload = {
  status?: string | null;
  event_date?: string | null;
  details?: string | null;
  budget_per_reservation?: number | string | null;
};

/** OpenAPI components/schemas/ReservationAcceptedCreateSchema (wed-backend) */
export type ReservationAcceptedCreate = {
  guest_first_name: string;
  guest_last_name: string;
  guest_email: string;
  guest_phone?: string | null;
  event_date?: string | null;
  details?: string | null;
  budget_per_reservation?: number | string | null;
  interested_dates?: string | null;
  guest_count?: number | null;
  event_type?: string | null;
  other_comments?: string | null;
};

/**
 * Backend stores reservation status as uppercase enums (e.g. PENDING, ACCEPTED, REJECTED).
 * UI / OpenAPI examples often use lowercase — normalize before PATCH.
 */
function normalizeStatusForApiPatch(status: string | null | undefined): string | null | undefined {
  if (status == null) return status;
  const t = status.trim().toLowerCase();
  if (t === 'accepted' || t === 'confirmed') return 'ACCEPTED';
  if (t === 'denied' || t === 'rejected' || t === 'declined') return 'REJECTED';
  if (t === 'pending') return 'PENDING';
  const u = status.trim().toUpperCase();
  if (u === 'ACCEPTED' || u === 'REJECTED' || u === 'PENDING') return u;
  return status;
}

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

/**
 * POST /reservations/accepted — Create Accepted Reservation (OpenAPI).
 */
export async function createAcceptedReservation(
  accessToken: string,
  tokenType: string,
  body: ReservationAcceptedCreate
): Promise<unknown> {
  const url = `${getApiBaseUrl()}/reservations/accepted`;
  const payload: Record<string, unknown> = {
    guest_first_name: body.guest_first_name.trim(),
    guest_last_name: body.guest_last_name.trim(),
    guest_email: body.guest_email.trim(),
    guest_phone: body.guest_phone?.trim() ? body.guest_phone.trim() : null,
    event_date: body.event_date ?? null,
    details: body.details?.trim() ? body.details.trim() : null,
    budget_per_reservation:
      body.budget_per_reservation === undefined || body.budget_per_reservation === null
        ? null
        : body.budget_per_reservation,
  };
  if (body.interested_dates !== undefined) {
    payload.interested_dates = body.interested_dates?.trim() ? body.interested_dates.trim() : null;
  }
  if (body.guest_count !== undefined && body.guest_count !== null) {
    payload.guest_count = body.guest_count;
  }
  if (body.event_type !== undefined) {
    payload.event_type = body.event_type?.trim() ? body.event_type.trim() : null;
  }
  if (body.other_comments !== undefined) {
    payload.other_comments = body.other_comments?.trim() ? body.other_comments.trim() : null;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseApiError(res.status, text));
  }
  if (!text) return null;
  return JSON.parse(text) as unknown;
}

async function authorizedGetJson(
  path: string,
  accessToken: string,
  tokenType: string
): Promise<unknown> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseApiError(res.status, text));
  }
  if (!text) return [];
  return JSON.parse(text) as unknown;
}

/** GET /reservations/accepted */
export async function getAcceptedReservations(
  accessToken: string,
  tokenType: string
): Promise<ReservationsSchema[]> {
  const data = await authorizedGetJson('/reservations/accepted', accessToken, tokenType);
  return Array.isArray(data) ? (data as ReservationsSchema[]) : [];
}

/** GET /reservations/pending */
export async function getPendingReservations(
  accessToken: string,
  tokenType: string
): Promise<ReservationsSchema[]> {
  const data = await authorizedGetJson('/reservations/pending', accessToken, tokenType);
  return Array.isArray(data) ? (data as ReservationsSchema[]) : [];
}

/**
 * Merges accepted + pending by id (accepted wins on duplicate).
 * OpenAPI: both return arrays of ReservationsSchema.
 */
export async function fetchAllReservations(
  accessToken: string,
  tokenType: string
): Promise<ReservationsSchema[]> {
  const [pending, accepted] = await Promise.all([
    getPendingReservations(accessToken, tokenType),
    getAcceptedReservations(accessToken, tokenType),
  ]);
  const byId = new Map<string, ReservationsSchema>();
  for (const r of pending) {
    byId.set(r.id, r);
  }
  for (const r of accepted) {
    byId.set(r.id, r);
  }
  return Array.from(byId.values());
}

/** Loads a single reservation by id from merged pending + accepted lists. */
export async function getReservationById(
  accessToken: string,
  tokenType: string,
  reservationId: string
): Promise<ReservationsSchema | null> {
  const all = await fetchAllReservations(accessToken, tokenType);
  return all.find((r) => r.id === reservationId) ?? null;
}

/**
 * PATCH /reservations/{reservation_id} — Update Reservation (OpenAPI).
 */
export async function patchReservation(
  accessToken: string,
  tokenType: string,
  reservationId: string,
  body: ReservationsUpdatePayload
): Promise<ReservationsSchema> {
  const url = `${getApiBaseUrl()}/reservations/${encodeURIComponent(reservationId)}`;
  const payload: ReservationsUpdatePayload = { ...body };
  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    payload.status = normalizeStatusForApiPatch(payload.status) ?? null;
  }
  console.log('[patchReservation] request', {
    url,
    method: 'PATCH',
    body: payload,
    bodyJson: JSON.stringify(payload),
  });
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log('[patchReservation] response', {
    ok: res.ok,
    status: res.status,
    text: text.length > 4000 ? `${text.slice(0, 4000)}…` : text,
  });
  if (!res.ok) {
    throw new Error(parseApiError(res.status, text));
  }
  if (!text) {
    throw new Error('Κενή απάντηση από τον διακομιστή');
  }
  return JSON.parse(text) as ReservationsSchema;
}
