import type { WeddingReservation } from './weddingReservationTypes';
import type { ReservationsSchema } from './reservationTypes';
import { toLocalYmd } from './dateUtils';

/**
 * Calendar day for an API `event_date`, aligned with the user's local timezone.
 * (Using only the UTC `YYYY-MM-DD` prefix was wrong vs `toLocalYmd` for "today" and filters.)
 */
export function eventDateToYmd(event_date: string | null | undefined): string | null {
  if (!event_date) return null;
  const trimmed = event_date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) {
    return trimmed.length >= 10 ? trimmed.slice(0, 10) : null;
  }
  return toLocalYmd(d);
}

/**
 * Pending / Εκκρεμεί — same bucket as EventRequests `uiStatus` pending.
 * These rows belong on Αιτήματα only, not on the main Κρατήσεις dashboard.
 */
export function isPendingReservationApiStatus(status: string | null | undefined): boolean {
  const t = (status || '').toLowerCase();
  if (t === 'accepted' || t === 'confirmed') return false;
  if (t === 'denied' || t === 'rejected' || t === 'declined') return false;
  return true;
}

function mapStatus(s: string | null | undefined): WeddingReservation['status'] {
  const t = (s || '').toLowerCase();
  if (t === 'cancelled' || t === 'canceled') return 'cancelled';
  if (t === 'completed' || t === 'complete') return 'completed';
  if (t === 'confirmed' || t === 'accepted') return 'confirmed';
  if (t === 'pending') return 'pending';
  return 'pending';
}

/** Map API reservation to the row shape used by dashboard / detail UI. */
export function apiReservationToWeddingReservation(r: ReservationsSchema): WeddingReservation {
  const couple = [r.couple_first_name, r.couple_last_name].filter(Boolean).join(' ').trim();
  const guest = [r.guest_first_name, r.guest_last_name].filter(Boolean).join(' ').trim();
  const client_name = couple || guest || 'Κράτηση';

  const wedding_date = eventDateToYmd(r.event_date) ?? toLocalYmd(new Date());

  const raw = r.budget_per_reservation;
  const budgetNum =
    raw != null && raw !== '' ? parseFloat(String(raw).replace(',', '.')) : NaN;

  return {
    id: r.id,
    client_name,
    wedding_date,
    venue: r.business_name?.trim() || (r.details && r.details.trim()) || '—',
    guest_count: Array.isArray(r.guests) ? r.guests.length : 0,
    contact_email: r.guest_email || '',
    contact_phone: r.guest_phone || '',
    status: mapStatus(r.status),
    package_type: '',
    budget: Number.isFinite(budgetNum) ? budgetNum : 0,
    notes: r.details || '',
    created_at: r.event_date || new Date().toISOString(),
    updated_at: r.event_date || new Date().toISOString(),
  };
}
