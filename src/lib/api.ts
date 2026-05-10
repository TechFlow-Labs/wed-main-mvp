export type GiftItem = {
  id: string;
  item_name: string;
  category: string | null;
  short_description: string | null;
  long_description: string | null;
  main_image_url: string | null;
  gallery_image_urls: string[];
};

export type GiftListResponse = {
  total: number;
  items: GiftItem[];
};

function getApiBaseUrl(): string {
  const explicit = import.meta.env.VITE_API_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  return `${window.location.origin}/public-api`;
}

function joinApiPath(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export async function fetchGiftLists(): Promise<GiftListResponse> {
  const res = await fetch(joinApiPath(getApiBaseUrl(), "/gifts/lists"), {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Αποτυχία φόρτωσης λίστας δώρων");
  return res.json();
}
