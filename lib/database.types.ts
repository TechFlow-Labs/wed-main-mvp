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
  created_at: string;
  updated_at: string;
};

export type EventSpaceRequest = {
  id: string;
  couple_name: string;
  contact_email: string;
  contact_phone: string;
  event_date: string;
  event_type: 'wedding' | 'baptism' | 'christening' | 'other';
  guest_count: number;
  preferred_space: string;
  message: string;
  admin_notes?: string;
  status: 'pending' | 'accepted' | 'denied';
  created_at: string;
  updated_at: string;
};
