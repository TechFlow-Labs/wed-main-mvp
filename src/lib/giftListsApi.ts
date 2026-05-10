export type GiftListItem = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  gift_count: number;
};

export type GiftListsResponse = {
  items: GiftListItem[];
  total: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8060';

export async function fetchGiftLists(): Promise<GiftListsResponse> {
  const response = await fetch(`${API_BASE}/public-api/gift-lists/`, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Αποτυχία φόρτωσης λιστών δώρων');
  }

  const data = (await response.json()) as Partial<GiftListsResponse>;
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: typeof data.total === 'number' ? data.total : Array.isArray(data.items) ? data.items.length : 0
  };
}
