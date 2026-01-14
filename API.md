# API Documentation

## Overview

All API endpoints are Supabase Edge Functions. They are accessed via:

```
https://your-project.supabase.co/functions/v1/[function-name]
```

All endpoints support CORS and return JSON responses.

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error

## Endpoints

### 1. Create Ticket

Creates a new support ticket and initial message.

**Endpoint:** `POST /functions/v1/create-ticket`

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "subject": "Issue with my order",
  "message": "I received the wrong item...",
  "priority": "high",
  "session_id": "session_123456789"
}
```

**Parameters:**
- `customer_name` (optional): Customer's name, defaults to "Anonymous"
- `customer_email` (optional): Customer's email address
- `subject` (required): Ticket subject (1-500 characters)
- `message` (required): Initial message (1-5000 characters)
- `priority` (optional): "low" | "medium" | "high", defaults to "medium"
- `session_id` (required): Unique session identifier for customer

**Response (201):**
```json
{
  "success": true,
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "session_123456789"
}
```

**Example:**
```typescript
const response = await fetch('https://project.supabase.co/functions/v1/create-ticket', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_name: 'John',
    customer_email: 'john@example.com',
    subject: 'Help needed',
    message: 'I need assistance',
    session_id: 'session_123'
  })
});
const data = await response.json();
console.log(data.ticket_id);
```

---

### 2. Add Message

Adds a message to an existing ticket.

**Endpoint:** `POST /functions/v1/add-message`

**Request Body:**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "sender_id": "customer_or_admin_id",
  "sender_type": "customer",
  "content": "Thank you for your help..."
}
```

**Parameters:**
- `ticket_id` (required): UUID of the ticket
- `sender_id` (required): UUID of the customer or admin
- `sender_type` (required): "customer" or "admin"
- `content` (required): Message content (1-5000 characters)

**Response (201):**
```json
{
  "success": true,
  "message": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "customer_or_admin_id",
    "sender_type": "customer",
    "content": "Thank you for your help...",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Example:**
```typescript
const response = await fetch('https://project.supabase.co/functions/v1/add-message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticket_id: 'ticket-uuid',
    sender_id: 'customer-uuid',
    sender_type: 'customer',
    content: 'My response to the ticket'
  })
});
```

---

### 3. Update Ticket Status

Updates the status of a ticket. Only admins can change status.

**Endpoint:** `POST /functions/v1/update-ticket-status`

**Request Body:**
```json
{
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "resolved",
  "admin_id": "admin-uuid"
}
```

**Parameters:**
- `ticket_id` (required): UUID of the ticket
- `status` (required): "pending" | "resolved" | "closed"
- `admin_id` (required): UUID of the admin user

**Response (200):**
```json
{
  "success": true,
  "ticket": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customer_id": "customer-uuid",
    "admin_id": "admin-uuid",
    "subject": "Issue with my order",
    "status": "resolved",
    "priority": "high",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "resolved_at": "2024-01-15T10:30:00Z"
  }
}
```

**Status Transitions:**
- `pending` → any other status
- `resolved` → pending or closed
- `closed` → no further messages allowed (read-only)

**Example:**
```typescript
const response = await fetch('https://project.supabase.co/functions/v1/update-ticket-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ticket_id: 'ticket-uuid',
    status: 'resolved',
    admin_id: 'admin-uuid'
  })
});
```

---

### 4. Get Signed URL

Generates signed URLs for file upload and download operations.

**Endpoint:** `POST /functions/v1/get-signed-url`

**Request Body:**
```json
{
  "action": "upload",
  "file_name": "document.pdf",
  "file_type": "application/pdf",
  "message_id": "message-uuid-optional"
}
```

**Parameters:**
- `action` (required): "upload" or "download"
- `file_name` (required): Name of the file
- `file_type` (required): MIME type of the file
- `message_id` (optional): Message ID for tracking

**Allowed File Types:**
- Images: image/jpeg, image/png, image/gif, image/webp
- Videos: video/mp4, video/webm
- Documents: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- Spreadsheets: application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- Text: text/plain
- Archives: application/zip

**Response (200):**
```json
{
  "success": true,
  "signed_url": "https://project.supabase.co/storage/v1/object/sign/support-attachments/...",
  "file_path": "attachments/1705318200000_document.pdf"
}
```

**Upload Example:**
```typescript
// 1. Get signed URL
const urlResponse = await fetch('https://project.supabase.co/functions/v1/get-signed-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'upload',
    file_name: 'myfile.pdf',
    file_type: 'application/pdf'
  })
});
const { signed_url } = await urlResponse.json();

// 2. Upload file to signed URL
const file = new File(['...'], 'myfile.pdf', { type: 'application/pdf' });
await fetch(signed_url, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/pdf' },
  body: file
});
```

**Download Example:**
```typescript
// 1. Get signed download URL
const urlResponse = await fetch('https://project.supabase.co/functions/v1/get-signed-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'download',
    file_name: 'document.pdf',
    file_type: 'application/pdf'
  })
});
const { signed_url } = await urlResponse.json();

// 2. Download file
const link = document.createElement('a');
link.href = signed_url;
link.download = 'document.pdf';
link.click();
```

---

## Authentication

### Customer/Widget
No authentication required. Customers are identified by `session_id` stored in browser localStorage.

### Admin Dashboard
Uses Supabase Authentication with email/password. Managed via `AuthContext`.

### Edge Functions
Edge Functions have access to Supabase through the `SUPABASE_ANON_KEY` and `SUPABASE_URL` environment variables.

---

## Rate Limiting

Currently no rate limiting enforced, but consider implementing for production:

```typescript
// Example rate limiting implementation
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(identifier) || [];
  const recent = timestamps.filter(t => now - t < windowMs);
  
  if (recent.length >= limit) return true;
  
  recent.push(now);
  rateLimitMap.set(identifier, recent);
  return false;
}
```

---

## Pagination

For large datasets, implement pagination:

```typescript
// Frontend query
const { data: tickets, error } = await supabase
  .from('tickets')
  .select('*')
  .range(0, 49)  // First 50
  .order('created_at', { ascending: false });

// Load more
.range(50, 99)  // Next 50
```

---

## Batch Operations

For multiple operations, send them sequentially:

```typescript
// Multiple messages (do not batch - process one at a time)
for (const message of messages) {
  await fetch('https://project.supabase.co/functions/v1/add-message', {
    method: 'POST',
    body: JSON.stringify(message)
  });
}
```

---

## CORS Details

All Edge Functions have the following CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

This allows requests from any origin during development. For production, restrict the origin:

```typescript
"Access-Control-Allow-Origin": "https://yourdomain.com"
```

---

## Webhook Integration (Future)

For future integration, Edge Functions can trigger webhooks:

```typescript
// In edge function
await fetch('https://yourhook.site/webhook', {
  method: 'POST',
  body: JSON.stringify({ ticket: ticket })
});
```

---

## SDK Examples

### Using Supabase JS Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(URL, KEY);

// Get ticket details
const { data: ticket } = await supabase
  .from('tickets')
  .select('*, messages(*)')
  .eq('id', ticketId)
  .single();

// Subscribe to changes
supabase
  .channel(`ticket:${ticketId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, (payload) => console.log(payload))
  .subscribe();
```

---

## Troubleshooting

### 500 Error
- Check Edge Function logs: `supabase functions fetch logs [function-name]`
- Verify all required parameters are provided
- Check database connection in Supabase Dashboard

### CORS Error
- Verify browser is making OPTIONS request first
- Check Edge Function returns correct CORS headers
- Clear browser cache

### Authentication Error
- Verify user exists in database
- Check JWT token is valid
- Verify RLS policies allow access

---

## Support

For API issues, check:
1. Edge Function logs
2. Supabase Dashboard Status
3. Browser Network tab
4. Console for specific error messages
