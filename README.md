# Customer Support Widget System

A full-stack customer support widget system built with React, Material UI, and Supabase.

## Features

### Customer Widget
- 💬 Embeddable chat-style widget for submitting support tickets
- 👤 Optional customer identification (no login required)
- 📎 File upload support (images, videos, documents)
- 📋 View all previous tickets and conversations
- ⚡ Real-time updates when admin replies
- 🏷️ Ticket status tracking (pending, resolved, closed)

### Admin Dashboard
- 🔐 Secure login with email/password
- 📊 Complete ticket management interface
- 💬 Reply to customer messages
- 🎯 Change ticket status
- 🔍 Search and filter tickets
- 📈 Analytics dashboard
- ⚡ Real-time updates for new tickets and replies

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material UI 5
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify (Frontend) + Supabase (Backend)

## Project Structure

```
├── frontend/                  # React application
│   ├── src/
│   │   ├── api/              # API clients and hooks
│   │   ├── components/       # React components
│   │   ├── config/           # Configuration files
│   │   ├── context/          # React contexts
│   │   ├── pages/            # Page components
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # App entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   └── vite.config.ts        # Vite configuration
│
├── supabase/                 # Supabase configuration
│   ├── migrations/           # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_analytics.sql
│   ├── functions/            # Edge functions
│   │   ├── create-ticket/
│   │   ├── add-message/
│   │   ├── update-ticket-status/
│   │   └── get-signed-url/
│   └── config.json
│
└── package.json              # Root package.json
```

## Database Schema

### Tables

- **users**: Admin users with email/password auth
- **customers**: Customer information (no login required)
- **tickets**: Support tickets with status tracking
- **messages**: Conversation messages
- **attachments**: File attachments to messages
- **analytics**: Aggregated analytics data

### Key Features
- Row-level security (RLS) for data privacy
- Indexes on frequently queried columns
- Automatic timestamps (created_at, updated_at)
- Status constraints and validations

See [Database ERD](#database-erd) below.

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- Git

### 1. Clone and Install

```bash
# Clone repository
git clone <your-repo>
cd simple-customer-support-widget-system

# Install dependencies
npm install
cd frontend && npm install && cd ..
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the API settings
3. Install Supabase CLI: `npm install -g supabase`
4. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

### 3. Deploy Database

```bash
# Push migrations to Supabase
supabase db push

# This will create all tables, indexes, and RLS policies
```

### 4. Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy create-ticket
supabase functions deploy add-message
supabase functions deploy update-ticket-status
supabase functions deploy get-signed-url
```

### 5. Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage section
2. Create new bucket: `support-attachments`
3. Set privacy to private
4. Allow authenticated access in RLS policies

Or run SQL in the SQL editor:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', false);
```

### 6. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-project.supabase.co
```

### 7. Create Admin Account

In Supabase Dashboard:
1. Go to Authentication section
2. Create a new user with email/password
3. Go to database and insert admin user in `users` table:

```sql
INSERT INTO users (email) VALUES ('admin@example.com');
```

Or use Supabase CLI to create auth user and table record.

### 8. Run Development Server

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

## Usage

### Customer Widget

The floating widget appears on any page where you include it:

```tsx
import { FloatingChatButton } from '@/components/FloatingChatButton';
import { WidgetProvider } from '@/context/WidgetContext';

function App() {
  return (
    <WidgetProvider>
      {/* Your app content */}
      <FloatingChatButton />
    </WidgetProvider>
  );
}
```

**Features:**
- Click floating button to open chat
- Submit tickets without login
- View previous tickets
- Real-time message updates
- Upload attachments

### Admin Dashboard

Access at `http://localhost:5173/admin`

**Login Credentials:**
- Email: admin@example.com
- Password: (as set during setup)

**Features:**
- View all tickets in table format
- Filter by status or search by subject/customer
- Click ticket to view conversation
- Reply to customer messages
- Change ticket status
- View analytics dashboard

## Deployment

### Frontend Deployment (Vercel)

```bash
# Build
cd frontend
npm run build

# Deploy to Vercel
npm install -g vercel
vercel
```

### Frontend Deployment (Netlify)

```bash
# Build
cd frontend
npm run build

# Deploy (drag and drop dist/ folder to Netlify)
# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=frontend/dist
```

### Environment Variables

Add to your hosting platform:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-project.supabase.co
```

### Supabase Edge Functions

Already deployed via CLI. To redeploy:

```bash
supabase functions deploy [function-name]
```

## Database ERD

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│  customers      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email           │
│ session_id      │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌──────────────────────┐
│      tickets         │
├──────────────────────┤
│ id (PK)              │
│ customer_id (FK)  ──┤──→ customers
│ admin_id (FK)    ──┤──→ users
│ subject             │
│ status              │
│ priority            │
│ created_at          │
│ updated_at          │
│ resolved_at         │
└──────────────────────┘

┌──────────────────────┐
│     messages         │
├──────────────────────┤
│ id (PK)              │
│ ticket_id (FK)   ──┤──→ tickets
│ sender_id           │
│ sender_type         │
│ content             │
│ created_at          │
│ updated_at          │
└──────────────────────┘

┌──────────────────────┐
│    attachments       │
├──────────────────────┤
│ id (PK)              │
│ message_id (FK)  ──┤──→ messages
│ file_name           │
│ file_type           │
│ file_size           │
│ storage_path        │
│ created_at          │
└──────────────────────┘

┌──────────────────────┐
│    analytics         │
├──────────────────────┤
│ id (PK)              │
│ metric_name         │
│ metric_value        │
│ recorded_date       │
│ created_at          │
└──────────────────────┘
```

## API Endpoints

All endpoints are Supabase Edge Functions:

### Create Ticket
- **POST** `/functions/v1/create-ticket`
- **Payload:**
  ```json
  {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "subject": "Issue with order",
    "message": "I have a problem with...",
    "priority": "high",
    "session_id": "session_123"
  }
  ```

### Add Message
- **POST** `/functions/v1/add-message`
- **Payload:**
  ```json
  {
    "ticket_id": "uuid",
    "sender_id": "uuid",
    "sender_type": "customer",
    "content": "My response..."
  }
  ```

### Update Ticket Status
- **POST** `/functions/v1/update-ticket-status`
- **Payload:**
  ```json
  {
    "ticket_id": "uuid",
    "status": "resolved",
    "admin_id": "uuid"
  }
  ```

### Get Signed URL
- **POST** `/functions/v1/get-signed-url`
- **Payload:**
  ```json
  {
    "action": "upload",
    "file_name": "document.pdf",
    "file_type": "application/pdf"
  }
  ```

## Real-time Features

The system uses Supabase Realtime to provide:

- **Instant new ticket notifications** for admins
- **Live message updates** in conversations
- **Status change updates** for customers
- **Analytics refresh** on the dashboard

Subscribe to channels:
```typescript
const subscription = supabase
  .channel(`ticket:${ticketId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `ticket_id=eq.${ticketId}`,
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

## Security Features

- **Row-level security (RLS)** on all tables
- **Session-based authentication** for customers (no login)
- **Email/password auth** for admins
- **File upload validation** (allowed file types only)
- **Input validation** in edge functions
- **CORS protection** on all endpoints
- **Secure signed URLs** for file operations

## Troubleshooting

### Edge Functions Not Working
- Check function deployment: `supabase functions list`
- View logs: `supabase functions fetch logs [function-name]`
- Ensure environment variables are set

### Storage Upload Failing
- Verify bucket exists and is not public
- Check RLS policies on storage.objects
- Ensure signed URL is not expired

### Real-time Updates Not Working
- Verify Realtime is enabled in Supabase settings
- Check browser console for connection errors
- Ensure subscription channel names match table filters

### Admin Login Not Working
- Verify user exists in both auth and users table
- Check password is correct
- Ensure RLS policies allow admin access

## Performance Optimization

- Indexes on frequently queried columns (customer_id, status, created_at)
- Message pagination (load first 50, then load more)
- Analytics view for quick aggregations
- Lazy loading of attachments

## Future Enhancements

- Email notifications for new tickets/replies
- Advanced analytics with date range filtering
- Ticket assignment to specific admins
- Canned responses for common issues
- Chat history export
- Multi-language support
- Mobile app

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
