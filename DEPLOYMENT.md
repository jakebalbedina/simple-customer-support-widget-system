# Deployment Guide

## Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Storage bucket created
- [ ] Admin user account created
- [ ] Supabase RLS policies verified
- [ ] Frontend build tested locally

## Step-by-Step Deployment

### 1. Supabase Setup

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push database migrations
supabase db push

# Deploy edge functions
supabase functions deploy create-ticket
supabase functions deploy add-message
supabase functions deploy update-ticket-status
supabase functions deploy get-signed-url
```

### 2. Supabase Storage Configuration

In Supabase Dashboard:
1. Navigate to Storage → Buckets
2. Create bucket: `support-attachments`
3. Set to private
4. Create folder structure if needed

Or via SQL:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('support-attachments', 'support-attachments', false, 52428800);

-- Grant permissions
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'support-attachments');

CREATE POLICY "Allow downloads" ON storage.objects FOR SELECT
USING (bucket_id = 'support-attachments');
```

### 3. Frontend Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel --prod

# Set environment variables
# During deployment, add:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_API_BASE_URL=https://your-project.supabase.co
```

### 4. Frontend Deployment to Netlify

```bash
# Build the frontend
cd frontend
npm run build

# Option A: Drag and drop dist/ to Netlify
# Option B: Use Netlify CLI

npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Add environment variables in Netlify Dashboard:
# Build & Deploy → Environment
```

### 5. Post-deployment Verification

- [ ] Test customer widget at `/widget` route
- [ ] Test admin login at `/admin` route
- [ ] Create a test ticket
- [ ] Verify real-time updates
- [ ] Test file upload
- [ ] Check analytics dashboard

## Environment Variables Reference

### Frontend (.env.local)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=https://your-project.supabase.co

# Note: These should NOT contain sensitive data (they're public)
```

### Vercel Deployment

```
Add in Vercel Dashboard > Settings > Environment Variables

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=https://your-project.supabase.co
```

## Custom Domain Setup

### Vercel
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

### Netlify
1. Go to Domain settings
2. Add custom domain
3. Configure DNS

## CORS Configuration

Edge functions handle CORS automatically. If needed, update CORS headers in edge function code:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
```

## Monitoring

### Vercel Analytics
- Visit Vercel Dashboard for build and deployment logs
- Monitor Core Web Vitals

### Supabase Monitoring
- Edge Function logs: `supabase functions fetch logs [function-name]`
- Database performance: Supabase Dashboard → Database → Queries
- Realtime status: Dashboard → Realtime

## Troubleshooting Deployment

### Edge Functions Not Accessible
```bash
# Check deployment status
supabase functions list

# Check logs
supabase functions fetch logs create-ticket

# Redeploy if needed
supabase functions deploy create-ticket
```

### CORS Errors in Browser
- Verify Edge Functions have correct CORS headers
- Check frontend URL in browser matches deployment
- Clear browser cache

### Database Connection Issues
- Verify connection string in Supabase settings
- Check RLS policies for public access
- Ensure edge functions have correct credentials

### Static File Not Loading
- Run `npm run build` to ensure dist/ is created
- Check Vercel/Netlify build settings
- Verify build output directory is correct

## Rollback Procedure

### Frontend
- Vercel: Click Previous Deployment → Promote to Production
- Netlify: Go to Deploys → Select previous version → Publish

### Database
```bash
# View migration history
supabase migration list

# Revert to previous migration (careful!)
supabase db reset  # This resets local database
```

## Performance Optimization Tips

1. **Enable CDN caching** on Vercel/Netlify
2. **Optimize images** before upload
3. **Use database indexes** (already configured)
4. **Implement message pagination** to avoid loading all messages
5. **Monitor bundle size** with `npm run build`

## Security Hardening

1. **Enable 2FA** on Supabase account
2. **Rotate API keys** regularly
3. **Use JWT tokens** for admin API access (if extending)
4. **Enable HTTPS** (automatic with Vercel/Netlify)
5. **Set up IP restrictions** on Supabase if needed

## Cost Optimization

- **Supabase Free Tier**: Good for development, 500 MB storage
- **Vercel Free Tier**: Good for small projects, 100 GB bandwidth
- **Monitor**: Supabase Dashboard → Project Settings → Billing
