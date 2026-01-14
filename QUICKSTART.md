# Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js 16+
- Supabase account (free tier works)
- Git

### Step 1: Create Supabase Project (2 min)

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create new project
4. Wait for setup to complete
5. Copy your **Project URL** and **Anon Key** from Settings → API

### Step 2: Clone & Install (2 min)

```bash
git clone <repository-url>
cd simple-customer-support-widget-system

npm install
cd frontend && npm install && cd ..
```

### Step 3: Configure Environment (1 min)

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=https://your-project.supabase.co
```

### Step 4: Deploy Supabase Setup

First, install Supabase CLI:
```bash
npm install -g supabase
```

Then deploy:
```bash
# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Deploy functions
supabase functions deploy create-ticket
supabase functions deploy add-message
supabase functions deploy update-ticket-status
supabase functions deploy get-signed-url

# Create storage bucket (SQL in Supabase Dashboard SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', false);
```

### Step 5: Create Admin User

In Supabase Dashboard SQL Editor:

```sql
-- Create auth user first (via Auth tab in Dashboard)
-- Then add to users table:
INSERT INTO users (email) VALUES ('admin@example.com');
```

Or simpler: Just insert into the users table, auth is handled by Supabase.

### Step 6: Run & Test (1 min)

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

- Widget demo: Click chat button bottom-right
- Admin: Go to `/admin` and login with `admin@example.com`

## Deployment (5 min)

### Deploy Frontend to Vercel

```bash
npm install -g vercel
cd frontend
npm run build
vercel --prod

# Add environment variables during deployment
```

### Deploy Frontend to Netlify

```bash
cd frontend
npm run build

# Drag dist/ folder to Netlify or:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Then add environment variables in dashboard.

## What's Included?

✅ Customer chat widget (embeddable)
✅ Admin dashboard  
✅ Real-time messaging
✅ File uploads
✅ Analytics
✅ Mobile responsive
✅ Clean Material UI design
✅ TypeScript throughout

## Next Steps

1. **Customize branding**: Edit colors in [frontend/src/App.tsx](frontend/src/App.tsx#L15)
2. **Add email notifications**: See [DEVELOPMENT.md](DEVELOPMENT.md)
3. **Deploy to production**: Follow [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Scale infrastructure**: Read Supabase scaling guide

## Troubleshooting

### Port 5173 already in use?
```bash
npm run dev -- --port 3000
```

### Supabase connection error?
```bash
# Check credentials
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Update .env.local
```

### Edge functions not working?
```bash
# Check deployment
supabase functions list

# View logs
supabase functions fetch logs create-ticket
```

### Storage uploads failing?
- Verify bucket `support-attachments` exists
- Check RLS policies in Supabase Dashboard
- Ensure bucket is NOT public

## Need Help?

- **Docs**: See [README.md](README.md), [API.md](API.md), [DEVELOPMENT.md](DEVELOPMENT.md)
- **Issues**: Check error messages in browser console and Edge Function logs
- **Community**: Ask on Supabase Discord

## Cost Estimate (Monthly)

- **Supabase Free**: $0 (good for development)
  - 500MB storage, basic performance
- **Supabase Pro**: $25+ (for production)
- **Vercel**: $0-20 (based on usage)
- **Total**: $25-50/month for small to medium businesses

Enjoy! 🚀
