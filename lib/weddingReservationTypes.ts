/** UI row shape for dashboard and reservation detail (mapped from API `ReservationsSchema`). */
export type WeddingReservation = {
  id: string;
  client_name: string;
  wedding_date: string;
  venue: string;
  guest_count: number;
  contact_email: string;
  contact_phone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  package_type: string;
  budget: number;
  notes: string;
  interested_dates?: string | null;
  other_comments?: string | null;
  created_at: string;
  updated_at: string;
};
