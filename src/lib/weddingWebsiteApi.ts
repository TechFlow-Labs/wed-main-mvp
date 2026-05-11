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

function normalize(base: string): string {
  return base.replace(/\/+$/, "");
}

export function apiBaseUrl(): string {
  return normalize(import.meta.env.VITE_API_URL || "http://localhost:8060");
}

export async function generateWeddingWebsite(
  payload: WeddingWebsitePayload
): Promise<WeddingWebsiteResponse> {
  const res = await fetch(`${apiBaseUrl()}/websites/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Failed to generate wedding website");
  }

  return res.json();
}
