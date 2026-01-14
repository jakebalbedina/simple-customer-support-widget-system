-- Remove foreign key constraint on tickets.admin_id
-- This is needed because admin_id references Supabase Auth users, not a local users table
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_admin_id_fkey;
