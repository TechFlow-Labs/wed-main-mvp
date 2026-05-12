import { getApiBaseUrl, getPublicWebBaseUrl } from "../../lib/apiConfig";

export type WebsiteFaqItem = {
  question: string;
  answer: string;
};

export type WebsiteScheduleItem = {
  time: string;
  title: string;
  description?: string | null;
};

export type WeddingWebsitePayload = {
  slug: string;
  couple_names: string;
  wedding_date: string;
  venue: string;
  story?: string;
  schedule: WebsiteScheduleItem[];
  faq: WebsiteFaqItem[];
};

export type WeddingWebsiteResponse = WeddingWebsitePayload & {
  rsvp_enabled: boolean;
  rsvp_deadline?: string | null;
  public_path: string;
  created_at: string;
  updated_at: string;
};

function parseApiError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as {
      detail?: string | { msg?: string }[] | { msg?: string };
    };
    if (typeof parsed.detail === "string") return parsed.detail;
    if (Array.isArray(parsed.detail) && parsed.detail[0]?.msg) {
      return parsed.detail.map((d) => d.msg).join(", ");
    }
  } catch {
    /* ignore */
  }
  return `Request failed (${status})`;
}

export function publicWeddingPageUrl(publicPath: string): string | null {
  const base = getPublicWebBaseUrl();
  if (!base) return null;
  const path = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  return `${base}${path}`;
}

export async function generateWeddingWebsite(
  payload: WeddingWebsitePayload
): Promise<WeddingWebsiteResponse> {
  const url = `${getApiBaseUrl()}/websites/generate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const bodyText = await res.text();
  if (!res.ok) {
    throw new Error(parseApiError(res.status, bodyText));
  }

  return JSON.parse(bodyText) as WeddingWebsiteResponse;
}
