-- Enable necessary extension (pgcrypto is preferred on Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add support for analytics
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value INTEGER,
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(metric_name, recorded_date)
);

-- Add indexes for analytics
CREATE INDEX idx_analytics_metric_date ON analytics(metric_name, recorded_date);

-- Create analytics view
CREATE OR REPLACE VIEW analytics_summary AS
SELECT
  (SELECT COUNT(*) FROM tickets WHERE status = 'pending') as open_tickets,
  (SELECT COUNT(*) FROM tickets WHERE status = 'resolved') as resolved_tickets,
  (SELECT COUNT(*) FROM tickets WHERE status = 'closed') as closed_tickets,
  (SELECT COUNT(DISTINCT customer_id) FROM tickets) as total_customers,
  (SELECT COUNT(*) FROM messages) as total_messages,
  (SELECT AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, CURRENT_TIMESTAMP) - created_at))/3600) 
     FROM tickets 
     WHERE resolved_at IS NOT NULL) as avg_resolution_hours;

-- Ensure RLS is enabled on analytics
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to view analytics" ON analytics
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users));

CREATE POLICY "Allow admins to insert analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users));
