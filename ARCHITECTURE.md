# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER BROWSER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Frontend (Vite)                                   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ Floating Chat Widget                            │   │   │
│  │  │ - Create Ticket Form                            │   │   │
│  │  │ - Ticket List View                              │   │   │
│  │  │ - Real-time Messages                            │   │   │
│  │  │ - File Upload Support                           │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────┬────────────────────────────────────────────┘
                      │ HTTPS
                      │ Session ID (localStorage)
                      ▼
        ┌─────────────────────────────────────────┐
        │   Supabase Edge Functions                │
        │   ┌──────────────────────────────────┐   │
        │   │ create-ticket                    │   │
        │   │ add-message                      │   │
        │   │ update-ticket-status             │   │
        │   │ get-signed-url                   │   │
        │   └──────────────────────────────────┘   │
        └──────────────┬──────────────────────────┘
                       │ WebSocket (Realtime)
                       │ HTTPS (REST)
                       ▼
        ┌─────────────────────────────────────────┐
        │      PostgreSQL Database                │
        │  ┌──────────────────────────────────┐   │
        │  │ Tables:                          │   │
        │  │ - users (admins)                 │   │
        │  │ - customers                      │   │
        │  │ - tickets                        │   │
        │  │ - messages                       │   │
        │  │ - attachments                    │   │
        │  │ - analytics                      │   │
        │  └──────────────────────────────────┘   │
        └──────────────┬──────────────────────────┘
                       │ Realtime Subscriptions
                       │
        ┌──────────────┴──────────────────────────┐
        │                                         │
        ▼                                         ▼
┌─────────────────────────┐     ┌────────────────────────────┐
│  ADMIN BROWSER          │     │  Supabase Storage          │
│  ┌───────────────────┐  │     │ (support-attachments)      │
│  │ Admin Dashboard   │  │     │                            │
│  │ - Login           │  │     │ Files:                     │
│  │ - Ticket Mgmt     │  │     │ - Images                   │
│  │ - Analytics       │  │     │ - Videos                   │
│  │ - Reply to msgs   │  │     │ - Documents                │
│  └───────────────────┘  │     │ - Archives                 │
└─────────────────────────┘     └────────────────────────────┘
```

## Data Flow

### Creating a Ticket (Customer)

1. **Customer Opens Widget** → `FloatingChatButton` component
2. **Fills Form** → `CreateTicketForm` component validates input
3. **Submits** → Calls `POST /functions/v1/create-ticket` Edge Function
4. **Edge Function**:
   - Validates input (subject, message length, email format)
   - Creates/finds customer by session_id
   - Creates ticket record
   - Creates initial message record
5. **Response** → Returns ticket_id and session_id
6. **UI Updates** → Displays ticket in `TicketDetail` view
7. **Real-time** → Supabase notifies all connected clients

### Admin Responding to Message

1. **Admin Views Dashboard** → `AdminDashboard` component
2. **Selects Ticket** → `TicketManagementView` displays all tickets
3. **Clicks Ticket** → `TicketDetail` shows conversation
4. **Types Response** → `MessageInput` component
5. **Submits** → Calls `POST /functions/v1/add-message`
6. **Edge Function**:
   - Verifies ticket exists and not closed
   - Validates message content
   - Creates message record with sender_type="admin"
7. **Response** → Returns created message
8. **Real-time Update** → 
   - `subscribeToTicketUpdates()` listener triggers
   - Message appears instantly for customer (no refresh needed)
   - Customer sees admin response in real-time

### File Upload Process

1. **Customer Selects File** → `MessageInput` stores in state
2. **On Send**:
   - First: Send message content via `add-message`
   - Then: Get signed URL via `get-signed-url`
   - Finally: Upload file directly to storage via signed URL
3. **Edge Function** (`get-signed-url`):
   - Validates file type (security)
   - Generates signed URL (1 hour for upload, 7 days for download)
   - Returns URL to client
4. **Client**:
   - Performs PUT request directly to storage
   - Never sends file through our functions (security + performance)
5. **Record**:
   - Save attachment record in database
   - Link to message_id for reference

## Authentication Flow

### Customer (Widget)
- **No login required**
- Uses **session_id** (random UUID stored in localStorage)
- Session_id sent with each request for identification
- Can view only their own tickets via session_id

### Admin (Dashboard)
- **Email/password authentication**
- Uses **Supabase Auth** (JWT tokens)
- Login creates session
- Token stored securely by Supabase
- Can view all tickets after login
- Can change ticket status and reply

## Real-time Updates

Uses **Supabase Realtime** with PostgreSQL LISTEN/NOTIFY:

```typescript
// Subscribe to new messages in a ticket
supabase
  .channel(`ticket:${ticketId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `ticket_id=eq.${ticketId}`,
  }, (payload) => {
    // Message appears instantly
  })
  .subscribe();
```

**Benefits:**
- No polling (efficient)
- Instant updates across all clients
- WebSocket connection (low latency)
- Automatic reconnection

## Component Hierarchy

```
App
├── AuthProvider (manages admin login)
├── BrowserRouter
│   └── Routes
│       ├── /login → LoginPage
│       │   └── AuthForm
│       │
│       ├── /admin → ProtectedRoute → AdminDashboard
│       │   ├── AppBar (Logout button)
│       │   ├── Tabs
│       │   │   ├── TicketManagementView
│       │   │   │   ├── FilterBar
│       │   │   │   ├── TicketsTable
│       │   │   │   │   └── TicketContextMenu
│       │   │   │   └── TicketDetail (Dialog)
│       │   │   │       ├── Message (array)
│       │   │   │       └── MessageInput
│       │   │   │
│       │   │   └── AnalyticsDashboard
│       │   │       ├── MetricsCards
│       │   │       └── Charts
│       │   │
│       │
│       └── /widget → WidgetProvider → WidgetDemoPage
│           └── FloatingChatButton
│               ├── Fab (floating button)
│               └── ChatWidget (Dialog)
│                   ├── Tabs
│                   │   ├── CreateTicketForm
│                   │   ├── TicketList
│                   │   └── TicketDetail
│                   │       ├── Message (array)
│                   │       └── MessageInput
```

## Security Considerations

### Frontend
- Session ID stored in localStorage (not sensitive)
- No credentials stored in browser
- HTTPS only communication
- Input validation before submission

### Backend (Edge Functions)
- Server-side input validation
- File type whitelist validation
- SQL injection prevention (Supabase SDK)
- CORS headers configured

### Database (RLS Policies)
- Customers can only see their own tickets
- Admins can see all tickets
- Customers can only create messages, not modify
- Attachments RLS based on ticket ownership

### Storage
- Files in private bucket
- Signed URLs expire (1hr upload, 7 days download)
- File type validation
- Size limits per bucket

## Performance Optimizations

### Frontend
- **Code Splitting**: Route-based splitting (already in Vite)
- **Lazy Loading**: Load messages on scroll
- **Memoization**: Prevent unnecessary re-renders
- **Caching**: Browser cache + localStorage

### Backend
- **Database Indexes**: On foreign keys, status, dates
- **Query Optimization**: Select only needed fields
- **Realtime Efficiency**: WebSocket vs polling
- **Storage**: Direct upload via signed URLs

### Deployment
- **CDN**: Vercel/Netlify automatic CDN
- **Compression**: Gzip enabled by default
- **Bundle Size**: ~150KB gzipped for React app

## Scalability

### Current Limits
- Supabase Free: 500MB storage, ~5 req/sec
- Can handle ~100-500 active users

### Scaling to Production
1. **Supabase Pro**: More storage, better performance
2. **Database Optimization**: Add more indexes as needed
3. **Caching Layer**: Redis for frequently accessed data
4. **Message Pagination**: Load first 50, then load more
5. **File Optimization**: Compress images, limit video size

## Monitoring & Debugging

### Frontend Debugging
- Browser DevTools Console
- React DevTools extension
- Network tab for API calls

### Backend Debugging
```bash
supabase functions fetch logs [function-name]
```

### Database Debugging
- Supabase Dashboard SQL Editor
- PostgreSQL logs

## Cost Analysis

### Supabase Free Tier
- Database: 1 GB, 2GB bandwidth/month
- Storage: 1 GB
- Functions: 144,000 invocations/month
- Realtime: Included

### Estimated Costs (10k users)
- Database: ~$100-200/month
- Storage: ~$5-10/month (depending on attachments)
- Functions: ~$10-20/month
- **Total**: ~$200-300/month

### Cost Optimization
- Compress media before upload
- Archive old tickets
- Implement file cleanup policies
- Monitor function usage
