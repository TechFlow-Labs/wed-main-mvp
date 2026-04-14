import { getApiBaseUrl } from './apiConfig';

/** OpenAPI components/schemas/BlogResponseSchema */
export type BlogResponseSchema = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

/** OpenAPI components/schemas/BlogCreateSchema */
export type BlogCreateSchema = {
  title: string;
  content: string;
  excerpt?: string | null;
  is_published?: boolean;
};

/** OpenAPI components/schemas/BlogUpdateSchema */
export type BlogUpdateSchema = {
  title?: string | null;
  content?: string | null;
  excerpt?: string | null;
  is_published?: boolean | null;
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

/** GET /blog/ — current user's blog posts */
export async function getBlogs(accessToken: string, tokenType: string): Promise<BlogResponseSchema[]> {
  const url = `${getApiBaseUrl()}/blog/`;
  const res = await fetch(url, {
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
  return Array.isArray(data) ? (data as BlogResponseSchema[]) : [];
}

/** POST /blog/ */
export async function createBlog(
  accessToken: string,
  tokenType: string,
  body: BlogCreateSchema
): Promise<BlogResponseSchema> {
  const url = `${getApiBaseUrl()}/blog/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiError(res.status, text));
  if (!text) throw new Error('Κενή απάντηση από τον διακομιστή');
  return JSON.parse(text) as BlogResponseSchema;
}

/** PATCH /blog/{blog_id} */
export async function updateBlog(
  accessToken: string,
  tokenType: string,
  blogId: string,
  body: BlogUpdateSchema
): Promise<BlogResponseSchema> {
  const url = `${getApiBaseUrl()}/blog/${encodeURIComponent(blogId)}`;
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
  if (!res.ok) throw new Error(parseApiError(res.status, text));
  if (!text) throw new Error('Κενή απάντηση από τον διακομιστή');
  return JSON.parse(text) as BlogResponseSchema;
}

/** DELETE /blog/{blog_id} */
export async function deleteBlog(
  accessToken: string,
  tokenType: string,
  blogId: string
): Promise<void> {
  const url = `${getApiBaseUrl()}/blog/${encodeURIComponent(blogId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(res.status, text));
  }
}
