/** Subset of OpenAPI components/schemas/GuestDashboard */
export type GuestDashboard = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  reservation_id?: string | null;
};

/** OpenAPI components/schemas/ReservationsSchema */
export type ReservationsSchema = {
  id: string;
  partner_id: string;
  couple_id?: string | null;
  guest_first_name?: string | null;
  guest_last_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  status?: string | null;
  event_date?: string | null;
  details?: string | null;
  budget_per_reservation?: string | null;
  business_name?: string | null;
  couple_first_name?: string | null;
  couple_last_name?: string | null;
  guests?: GuestDashboard[];
  notes?: unknown[];
  interested_dates?: string | null;
  guest_count?: number | null;
  event_type?: string | null;
  other_comments?: string | null;
};
