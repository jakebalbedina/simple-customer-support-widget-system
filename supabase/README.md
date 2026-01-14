## Supabase Configuration

This directory contains all Supabase-related files including:

- **migrations/**: Database migration files
  - `001_initial_schema.sql`: Main database schema with tables, indexes, and RLS policies
  - `002_analytics.sql`: Analytics tables and views

- **functions/**: Edge Functions (serverless functions)
  - `create-ticket/`: Creates support tickets
  - `add-message/`: Adds messages to tickets
  - `update-ticket-status/`: Updates ticket status (admin only)
  - `get-signed-url/`: Generates signed URLs for file operations

### Setup Instructions

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase project:
   ```bash
   supabase init
   ```

3. Link to your Supabase project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Deploy migrations:
   ```bash
   supabase db push
   ```

5. Deploy edge functions:
   ```bash
   supabase functions deploy create-ticket
   supabase functions deploy add-message
   supabase functions deploy update-ticket-status
   supabase functions deploy get-signed-url
   ```

6. Create storage bucket:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('support-attachments', 'support-attachments', false);
   ```
