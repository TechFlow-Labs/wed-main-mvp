-- Add admin_notes column for partner's internal notes
ALTER TABLE event_space_requests 
ADD COLUMN IF NOT EXISTS admin_notes text DEFAULT '';
