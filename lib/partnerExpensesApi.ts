import { getApiBaseUrl } from './apiConfig';

/** OpenAPI components/schemas/PartnerExpenseItemSchema */
export type PartnerExpenseItemSchema = {
  id: string;
  title: string;
  amount: string;
  category?: string | null;
  expense_date: string;
  created_at: string;
};

/** OpenAPI components/schemas/PartnerExpenseSummarySchema */
export type PartnerExpenseSummarySchema = {
  total_expenses: string;
  items: PartnerExpenseItemSchema[];
};

/** OpenAPI components/schemas/PartnerExpenseCreateSchema */
export type PartnerExpenseCreateSchema = {
  title: string;
  amount: number | string;
  category?: string | null;
  expense_date?: string | null;
};

/** OpenAPI components/schemas/PartnerExpenseUpdateSchema */
export type PartnerExpenseUpdateSchema = {
  title?: string | null;
  amount?: number | string | null;
  category?: string | null;
  expense_date?: string | null;
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

/** GET /partner_expenses/ */
export async function getPartnerExpenses(
  accessToken: string,
  tokenType: string
): Promise<PartnerExpenseSummarySchema> {
  const url = `${getApiBaseUrl()}/partner_expenses/`;
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
  if (!text) {
    return { total_expenses: '0', items: [] };
  }
  return JSON.parse(text) as PartnerExpenseSummarySchema;
}

/** POST /partner_expenses/ */
export async function createPartnerExpense(
  accessToken: string,
  tokenType: string,
  body: PartnerExpenseCreateSchema
): Promise<PartnerExpenseItemSchema> {
  const url = `${getApiBaseUrl()}/partner_expenses/`;
  const payload: PartnerExpenseCreateSchema = {
    title: body.title.trim(),
    amount: body.amount,
    category: body.category?.trim() ? body.category.trim() : null,
    expense_date: body.expense_date?.trim() ? body.expense_date.trim() : null,
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
  return JSON.parse(text) as PartnerExpenseItemSchema;
}

/** PATCH /partner_expenses/{expense_id} */
export async function updatePartnerExpense(
  accessToken: string,
  tokenType: string,
  expenseId: string,
  body: PartnerExpenseUpdateSchema
): Promise<PartnerExpenseItemSchema> {
  const url = `${getApiBaseUrl()}/partner_expenses/${encodeURIComponent(expenseId)}`;
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
  return JSON.parse(text) as PartnerExpenseItemSchema;
}
