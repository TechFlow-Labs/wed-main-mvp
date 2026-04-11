/*
  # Create Event Space Requests

  Table for requests from couples to use a partner's space for their event.
  Partners can view requests and accept or deny them.
*/

CREATE TABLE IF NOT EXISTS event_space_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text DEFAULT '',
  event_date date NOT NULL,
  event_type text DEFAULT 'wedding' CHECK (event_type IN ('wedding', 'baptism', 'christening', 'other')),
  guest_count integer DEFAULT 0,
  preferred_space text DEFAULT '',
  message text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'denied')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE event_space_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to event space requests"
  ON event_space_requests
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_event_space_requests_status 
  ON event_space_requests(status);

CREATE INDEX IF NOT EXISTS idx_event_space_requests_date 
  ON event_space_requests(event_date);
