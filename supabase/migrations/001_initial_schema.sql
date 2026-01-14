-- Enable pgcrypto extension (preferred on Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table (admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table (no auth required)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255),
  session_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  admin_id UUID,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'closed')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_type VARCHAR(50) CHECK (sender_type IN ('customer', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER,
  storage_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_admin_id ON tickets(admin_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_attachments_message_id ON attachments(message_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_session_id ON customers(session_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Customers table policies
CREATE POLICY "Allow anyone to insert customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow customers to view their own data" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Allow customers to update their own data" ON customers
  FOR UPDATE USING (true);

-- Tickets table policies - Allow public read/write for customer widget
CREATE POLICY "Allow anyone to insert tickets" ON tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to view tickets" ON tickets
  FOR SELECT USING (true);

CREATE POLICY "Allow updates to tickets" ON tickets
  FOR UPDATE USING (true);

CREATE POLICY "Allow deletes to tickets" ON tickets
  FOR DELETE USING (true);

-- Messages table policies
CREATE POLICY "Allow anyone to insert messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to view messages" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Allow updates to messages" ON messages
  FOR UPDATE USING (true);

-- Attachments table policies
CREATE POLICY "Allow anyone to insert attachments" ON attachments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to view attachments" ON attachments
  FOR SELECT USING (true);
