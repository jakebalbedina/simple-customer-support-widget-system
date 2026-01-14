-- Re-enable RLS for real-time subscriptions to work
-- Using permissive policies to allow public access while enabling real-time events

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anyone to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow customers to view their own data" ON customers;
DROP POLICY IF EXISTS "Allow customers to update their own data" ON customers;
DROP POLICY IF EXISTS "Allow anyone to insert tickets" ON tickets;
DROP POLICY IF EXISTS "Allow anyone to view tickets" ON tickets;
DROP POLICY IF EXISTS "Allow updates to tickets" ON tickets;
DROP POLICY IF EXISTS "Allow deletes to tickets" ON tickets;
DROP POLICY IF EXISTS "Allow anyone to insert messages" ON messages;
DROP POLICY IF EXISTS "Allow anyone to view messages" ON messages;
DROP POLICY IF EXISTS "Allow updates to messages" ON messages;
DROP POLICY IF EXISTS "Allow anyone to insert attachments" ON attachments;
DROP POLICY IF EXISTS "Allow anyone to view attachments" ON attachments;

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE attachments DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow all operations
-- Customers table
CREATE POLICY "Allow all on customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

-- Tickets table
CREATE POLICY "Allow all on tickets" ON tickets
  FOR ALL USING (true) WITH CHECK (true);

-- Messages table
CREATE POLICY "Allow all on messages" ON messages
  FOR ALL USING (true) WITH CHECK (true);

-- Attachments table
CREATE POLICY "Allow all on attachments" ON attachments
  FOR ALL USING (true) WITH CHECK (true);

-- Users table
CREATE POLICY "Allow all on users" ON users
  FOR ALL USING (true) WITH CHECK (true);
