import { getApiBaseUrl } from './apiConfig';

export type VendorAllocation = {
  reservation_id: string;
  partner_id: string;
  business_name: string;
  category: string | null;
  amount: number;
  event_date: string | null;
};

export type BudgetSummary = {
  total_budget: number;
  spent_budget: number;
  remaining_budget: number;
  vendor_allocations: VendorAllocation[];
};

export type BudgetDashboard = {
  total_budget: number;
  updated_at: string;
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

export async function getBudgetSummary(
  accessToken: string,
  tokenType: string
): Promise<BudgetSummary> {
  const res = await fetch(`${getApiBaseUrl()}/budget/summary`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiError(res.status, text));
  return JSON.parse(text) as BudgetSummary;
}

export async function setTotalBudget(
  accessToken: string,
  tokenType: string,
  amount: number
): Promise<BudgetDashboard> {
  const res = await fetch(`${getApiBaseUrl()}/budget/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `${tokenType} ${accessToken}`,
    },
    body: JSON.stringify({ total_budget: amount }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(parseApiError(res.status, text));
  return JSON.parse(text) as BudgetDashboard;
}
