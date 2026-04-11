import { getApiBaseUrl } from './apiConfig';

/** OpenAPI components/schemas/NoteResponseSchema */
export type NoteResponseSchema = {
  id: string;
  author_id: string;
  reservation_id?: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

/** OpenAPI components/schemas/NoteCreateSchema */
export type NoteCreateSchema = {
  content: string;
  reservation_id?: string | null;
};

/** OpenAPI components/schemas/NoteUpdateSchema */
export type NoteUpdateSchema = {
  content?: string | null;
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

/** GET /notes/ — global notes list */
export async function getNotes(accessToken: string, tokenType: string): Promise<NoteResponseSchema[]> {
  const url = `${getApiBaseUrl()}/notes/`;
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
  const data = JSON.parse(text) as unknown;
  return Array.isArray(data) ? (data as NoteResponseSchema[]) : [];
}

/** POST /notes/ */
export async function createNote(
  accessToken: string,
  tokenType: string,
  body: NoteCreateSchema
): Promise<NoteResponseSchema> {
  const url = `${getApiBaseUrl()}/notes/`;
  const payload: NoteCreateSchema = {
    content: body.content.trim(),
    reservation_id: body.reservation_id?.trim() ? body.reservation_id.trim() : null,
  };
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
  if (!text) {
    throw new Error('Κενή απάντηση από τον διακομιστή');
  }
  return JSON.parse(text) as NoteResponseSchema;
}

/** PATCH /notes/{note_id} */
export async function updateNote(
  accessToken: string,
  tokenType: string,
  noteId: string,
  body: NoteUpdateSchema
): Promise<NoteResponseSchema> {
  const url = `${getApiBaseUrl()}/notes/${encodeURIComponent(noteId)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseApiError(res.status, text));
  }
  if (!text) {
    throw new Error('Κενή απάντηση από τον διακομιστή');
  }
  return JSON.parse(text) as NoteResponseSchema;
}
