/*
  # Create Wedding Reservations System

  1. New Tables
    - `wedding_reservations`
      - `id` (uuid, primary key) - Unique identifier for each reservation
      - `client_name` (text) - Name of the couple/client
      - `wedding_date` (date) - Date of the wedding event
      - `venue` (text) - Wedding venue name
      - `guest_count` (integer) - Expected number of guests
      - `contact_email` (text) - Client's email address
      - `contact_phone` (text) - Client's phone number
      - `status` (text) - Reservation status (pending, confirmed, completed, cancelled)
      - `package_type` (text) - Type of wedding package selected
      - `budget` (numeric) - Estimated budget for the event
      - `notes` (text) - Additional notes or special requests
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `wedding_reservations` table
    - Add policy for public access (can be restricted later with auth)
*/

CREATE TABLE IF NOT EXISTS wedding_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  wedding_date date NOT NULL,
  venue text NOT NULL,
  guest_count integer DEFAULT 0,
  contact_email text NOT NULL,
  contact_phone text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  package_type text DEFAULT '',
  budget numeric(10,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wedding_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to reservations"
  ON wedding_reservations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wedding_reservations_date 
  ON wedding_reservations(wedding_date);

CREATE INDEX IF NOT EXISTS idx_wedding_reservations_status 
  ON wedding_reservations(status);