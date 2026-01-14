# 📋 Documentation Index

Welcome to the Customer Support Widget System! This file will help you navigate all the documentation.

## 🚀 First Time Here? Start Here!

1. **New to this project?** → Start with [QUICKSTART.md](QUICKSTART.md) (5 min read)
2. **Want to understand it first?** → Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
3. **Ready to deploy?** → Follow [DEPLOYMENT.md](DEPLOYMENT.md)

## 📚 Complete Documentation Guide

### Core Documentation

| File | Purpose | Read Time |
|------|---------|-----------|
| [README.md](README.md) | Complete project guide, setup, database schema, ERD | 15 min |
| [QUICKSTART.md](QUICKSTART.md) | Rapid 5-minute setup guide for developers | 5 min |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | What you've built, features, and quick reference | 10 min |

### For Deployment

| File | Purpose | Read Time |
|------|---------|-----------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Step-by-step deployment to Vercel/Netlify | 10 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, data flows, and scalability | 15 min |

### For Development

| File | Purpose | Read Time |
|------|---------|-----------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Development setup, code structure, adding features | 20 min |
| [API.md](API.md) | Complete API endpoint documentation with examples | 15 min |

### Supabase Backend

| File | Purpose | Read Time |
|------|---------|-----------|
| [supabase/README.md](supabase/README.md) | Supabase setup, migrations, functions deployment | 10 min |

## 🎯 Finding What You Need

### "I want to..."

**...get started quickly**
→ [QUICKSTART.md](QUICKSTART.md)

**...understand the system**
→ [ARCHITECTURE.md](ARCHITECTURE.md) then [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

**...deploy to production**
→ [DEPLOYMENT.md](DEPLOYMENT.md)

**...add new features**
→ [DEVELOPMENT.md](DEVELOPMENT.md)

**...understand the API**
→ [API.md](API.md)

**...set up Supabase**
→ [supabase/README.md](supabase/README.md)

**...see the database schema**
→ [README.md](README.md#database-schema)

**...troubleshoot an issue**
→ [README.md](README.md#troubleshooting) or [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting-deployment)

## 📂 Project Structure

```
simple-customer-support-widget-system/
├── frontend/                    # React application
│   ├── src/
│   │   ├── api/                # API client functions
│   │   ├── components/         # React components
│   │   ├── config/             # Configuration
│   │   ├── context/            # React Context
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Helper utilities
│   │   ├── App.tsx             # Main app
│   │   ├── main.tsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example            # Environment template
│
├── supabase/                   # Backend configuration
│   ├── migrations/             # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_analytics.sql
│   ├── functions/              # Edge Functions
│   │   ├── create-ticket/
│   │   ├── add-message/
│   │   ├── update-ticket-status/
│   │   └── get-signed-url/
│   └── config.json
│
├── README.md                   # Main project guide
├── QUICKSTART.md               # Quick setup guide
├── DEPLOYMENT.md               # Deployment guide
├── DEVELOPMENT.md              # Development guide
├── API.md                      # API documentation
├── ARCHITECTURE.md             # Architecture details
├── PROJECT_SUMMARY.md          # Project overview
├── INDEX.md                    # This file
├── .gitignore
└── package.json
```

## 🔑 Key Concepts

### Components Explained

**Customer Widget**
- Floating button in bottom-right corner
- Opens dialog with tabs for creating tickets and viewing messages
- No login required, uses session ID for identification
- Real-time message updates

**Admin Dashboard**
- Login required (email/password)
- View all tickets in table
- Search and filter functionality
- Detailed ticket view with message history
- Analytics dashboard

**Real-time Features**
- Messages appear instantly when new ticket/reply is created
- Powered by Supabase Realtime (WebSocket)
- No page refresh needed

**File Uploads**
- Support for images, videos, PDFs, documents
- Files stored in Supabase Storage
- Signed URLs for secure access
- Directly uploaded to storage (not through API)

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Material UI, Vite
- **Backend**: Supabase, PostgreSQL, Edge Functions
- **Storage**: Supabase Storage (S3-like)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth (admin), Session ID (customer)
- **Deployment**: Vercel/Netlify (frontend), Supabase (backend)

## ⚡ Common Commands

```bash
# Development
npm install
cd frontend && npm run dev

# Build
cd frontend && npm run build

# Supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy create-ticket
supabase functions fetch logs create-ticket

# Deployment
vercel --prod
netlify deploy --prod --dir=dist
```

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Admin users |
| `customers` | Customer information |
| `tickets` | Support tickets |
| `messages` | Ticket messages |
| `attachments` | File attachments |
| `analytics` | Analytics data |

See [README.md#database-erd](README.md#database-erd) for full ERD.

## 🔐 Security Features

- Row-level security (RLS) on all tables
- Signed URLs for file access
- Input validation on all endpoints
- Session-based authentication for customers
- Email/password authentication for admins

## 📞 Need Help?

1. Check the specific documentation file
2. Review code comments (well-documented)
3. Check [README.md#troubleshooting](README.md#troubleshooting)
4. Review [API.md](API.md) for endpoint issues
5. Check Edge Function logs: `supabase functions fetch logs [name]`

## ✅ Deployment Checklist

- [ ] Read [QUICKSTART.md](QUICKSTART.md)
- [ ] Configure environment variables
- [ ] Deploy to Supabase
- [ ] Create admin user
- [ ] Build frontend
- [ ] Deploy to Vercel/Netlify
- [ ] Test widget on live site
- [ ] Test admin dashboard
- [ ] Set up custom domain (optional)

## 📖 Reading Order Recommended

**For New Users:**
1. [QUICKSTART.md](QUICKSTART.md) - Get it running (5 min)
2. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Understand what you have (10 min)
3. [README.md](README.md) - Full reference guide (15 min)

**For Developers Adding Features:**
1. [DEVELOPMENT.md](DEVELOPMENT.md) - Code structure
2. [ARCHITECTURE.md](ARCHITECTURE.md) - How things work
3. [API.md](API.md) - Available endpoints

**For Deployment:**
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Step-by-step
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Understanding the system
3. [README.md](README.md) - Reference if needed

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Material UI Documentation](https://mui.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🚀 Next Steps

1. **Get it running**: [QUICKSTART.md](QUICKSTART.md)
2. **Understand it**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
3. **Deploy it**: [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Extend it**: [DEVELOPMENT.md](DEVELOPMENT.md)

---

**Last Updated**: January 2024
**Project Version**: 1.0.0
**Status**: Production Ready ✅
