# Development Guide

## Local Development Setup

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd simple-customer-support-widget-system

# 2. Install root dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Setup Supabase locally (optional)
npm install -g supabase
supabase start  # Requires Docker
```

### Environment Variables

Create `frontend/.env.local`:

```env
# For local development with remote Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://your-project.supabase.co

# For local Supabase
# VITE_SUPABASE_URL=http://localhost:54321
# VITE_SUPABASE_ANON_KEY=eyJhbGc...
# VITE_API_BASE_URL=http://localhost:54321
```

### Running Development Server

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

## Project Structure Explanation

### Frontend (`frontend/`)

#### `/src/api/`
- `client.ts`: HTTP client for Edge Functions
- `supabase.ts`: Supabase queries and subscriptions

#### `/src/components/`
- **Widget Components:**
  - `FloatingChatButton.tsx`: Button to open chat widget
  - `ChatWidget.tsx`: Main chat widget dialog
  - `TicketList.tsx`: List of customer tickets
  - `TicketDetail.tsx`: Single ticket view with messages
  - `CreateTicketForm.tsx`: Form to create new ticket
  - `Message.tsx`: Individual message display
  - `MessageInput.tsx`: Input area for new messages

- **Admin Components:**
  - `TicketManagementView.tsx`: Admin ticket list and management
  - `AnalyticsDashboard.tsx`: Stats and charts
  - `TicketContextMenu.tsx`: Ticket actions menu

#### `/src/config/`
- `environment.ts`: Environment variable loading
- `supabase.ts`: Supabase client initialization

#### `/src/context/`
- `WidgetContext.tsx`: Widget state management (session, customer)
- `AuthContext.tsx`: Admin authentication context

#### `/src/pages/`
- `LoginPage.tsx`: Admin login page
- `AdminDashboard.tsx`: Admin dashboard layout

### Supabase (`supabase/`)

#### `/migrations/`
- `001_initial_schema.sql`: Database schema
- `002_analytics.sql`: Analytics tables

#### `/functions/`
Each function is in its own directory with `index.ts`

### Configuration Files

- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.cjs`: ESLint configuration
- `package.json`: Dependencies and scripts

## Common Development Tasks

### Adding a New Component

```tsx
// 1. Create component file
// frontend/src/components/MyComponent.tsx

import { Box } from '@mui/material';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <Box>
      <h1>{title}</h1>
    </Box>
  );
};

// 2. Import and use in App.tsx or other components
import { MyComponent } from '@/components/MyComponent';
```

### Adding a New Database Table

```sql
-- 1. Create migration file
-- supabase/migrations/003_new_table.sql

CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create index
CREATE INDEX idx_my_table_name ON my_table(name);

-- 3. Enable RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- 4. Create policy
CREATE POLICY "Allow all" ON my_table FOR SELECT USING (true);

-- 5. Push migration
supabase db push
```

### Adding a New Edge Function

```typescript
// 1. Create function directory
// supabase/functions/my-function/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    return new Response(
      JSON.stringify({ success: true, message }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// 2. Deploy
supabase functions deploy my-function

// 3. Call from frontend
const response = await fetch(
  `${supabaseUrl}/functions/v1/my-function`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello' }),
  }
);
```

### Testing Edge Functions Locally

```bash
# 1. Start Supabase locally
supabase start

# 2. Test function
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-ticket' \
  --header 'Content-Type: application/json' \
  --data '{"subject":"Test","message":"Test message","session_id":"123"}'
```

### Debugging

#### Browser DevTools
- F12 to open developer tools
- Console tab for errors/logs
- Network tab to see API calls
- React DevTools extension for component inspection

#### Edge Function Logs
```bash
supabase functions fetch logs create-ticket
```

#### Database Queries
```bash
# Access Supabase dashboard SQL editor
# Or use supabase CLI:
supabase db execute
```

## Code Style

### TypeScript Best Practices
- Use explicit types for function parameters and returns
- Avoid `any` type - use `unknown` if needed
- Use interfaces over types for React components

### React Best Practices
- Use functional components with hooks
- Extract complex components into smaller ones
- Use context for global state (auth, widget state)
- Memoize expensive computations with `useMemo`

### Material UI Best Practices
- Use `sx` prop for inline styles
- Leverage theme colors and spacing
- Responsive design with `xs`, `sm`, `md`, `lg` breakpoints
- Use built-in components (avoid custom styling)

### Example:
```tsx
import { Box, Button, TextField } from '@mui/material';
import { useCallback } from 'react';

interface FormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
  }, [onSubmit]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Name" fullWidth />
      <Button type="submit" variant="contained">Submit</Button>
    </Box>
  );
};
```

## Performance Tips

1. **Code Splitting**: Use React.lazy() for route components
2. **Image Optimization**: Use responsive images
3. **Database Queries**: Use indexes and limit results
4. **Caching**: Leverage browser cache and Supabase caching
5. **Memoization**: Use useMemo and useCallback for expensive operations

## Testing

Currently no automated tests included. To add:

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Create test file
# frontend/src/components/__tests__/MyComponent.test.tsx

import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});

# Run tests
npm run test
```

## Version Management

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm update package-name

# Install latest version
npm install package-name@latest
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request on GitHub
```

## Useful Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Material UI Documentation](https://mui.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
