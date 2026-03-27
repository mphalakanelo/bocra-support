# BOCRA Support Centre

A full-stack Next.js 15 support portal for the Botswana Communications Regulatory Authority — featuring an AI assistant, knowledge base, live agent chat, and complaint filing system.

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Framework  | Next.js 15 (App Router)                         |
| UI         | React 19 + Tailwind CSS                         |
| Database   | Supabase (PostgreSQL)                           |
| Auth       | Supabase Auth (email + Google OAuth)            |
| AI         | Anthropic Claude `claude-sonnet-4-20250514`     |
| Storage    | Supabase Storage (complaint attachments)        |
| Deployment | Vercel                                          |

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/bocra-support.git
cd bocra-support
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Once created, open **SQL Editor** → paste and run the full contents of `supabase/migrations/001_initial_schema.sql`
3. Enable **Google OAuth** (optional): Authentication → Providers → Google → add your Client ID & Secret
4. Copy your project credentials from **Settings → API**

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel

# Add environment variables
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Add the 4 environment variables in **Project Settings → Environment Variables**
4. Deploy

### Configure Supabase Redirect URLs

In Supabase **Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Streaming AI chat (Claude)
│   │   ├── agent/route.ts         # Live agent responses (Claude-as-agent)
│   │   ├── complaints/route.ts    # CRUD complaints
│   │   ├── complaints/attachments/route.ts
│   │   ├── queue/route.ts         # Queue management
│   │   └── kb/route.ts            # Knowledge base CRUD
│   ├── admin/                     # Admin dashboard (agent/admin roles only)
│   ├── auth/callback/             # Supabase OAuth callback
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── SupportCentre.tsx          # Main shell + tab navigation
│   ├── AuthModal.tsx              # Sign in / sign up modal
│   ├── chat/AIChatPanel.tsx       # Streaming AI chat with KB sidebar
│   ├── kb/KnowledgeBasePanel.tsx  # Full knowledge base browser
│   ├── kb/kbData.ts               # Static KB article data
│   ├── live/LiveChatPanel.tsx     # Live agent chat with queue system
│   ├── complaint/ComplaintFormPanel.tsx  # 4-step complaint wizard
│   └── ui/index.tsx               # Shared UI components
├── hooks/useAuth.tsx              # Supabase auth context
├── lib/
│   ├── supabase/client.ts         # Browser Supabase client
│   ├── supabase/server.ts         # Server Supabase client
│   ├── supabase/database.types.ts # TypeScript types
│   └── utils.ts                   # Helpers + constants
└── types/index.ts
```

---

## Database Schema

The migration in `supabase/migrations/001_initial_schema.sql` creates:

| Table                  | Purpose                                           |
|------------------------|---------------------------------------------------|
| `profiles`             | User accounts (extends Supabase auth.users)       |
| `complaints`           | Filed complaints + auto-generated reference numbers|
| `complaint_attachments`| Uploaded files linked to complaints               |
| `complaint_history`    | Status change audit trail                         |
| `chat_sessions`        | Live agent + AI chat sessions                     |
| `chat_messages`        | Individual messages in chat sessions              |
| `kb_categories`        | Knowledge base categories                         |
| `kb_articles`          | Knowledge base articles (editable by admins)      |

Row Level Security (RLS) is enabled on all tables:
- Citizens can only read their own data
- Agents can read all complaints and chat sessions
- Admins have full access

---

## User Roles

| Role      | Access                                             |
|-----------|----------------------------------------------------|
| `citizen` | File complaints, track own cases, chat             |
| `agent`   | All citizen access + view all complaints + admin panel |
| `admin`   | Full access including KB article management        |

To promote a user to admin, run in Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin' WHERE id = 'user-uuid-here';
```

---

## Features

- **🤖 AI Assistant** — Claude-powered streaming chat with BOCRA knowledge base
- **📚 Knowledge Base** — 7 categories, 26+ articles covering regulations, consumer rights, complaint procedures, and operators
- **💬 Live Chat** — Real queue system with position tracking, countdown timer, and Claude-as-agent responses
- **📋 Complaint Form** — 4-step wizard with file uploads, Supabase storage, and auto-generated reference numbers
- **👤 Authentication** — Email + Google OAuth via Supabase Auth
- **🔒 Admin Dashboard** — Complaint management, status updates, filtering and search
- **🏗️ Real-time** — Supabase Realtime enabled on chat_messages and chat_sessions tables

---

## Environment Variables Reference

| Variable                         | Where to find                         |
|----------------------------------|---------------------------------------|
| `ANTHROPIC_API_KEY`              | console.anthropic.com → API Keys      |
| `NEXT_PUBLIC_SUPABASE_URL`       | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase → Settings → API → anon key  |
| `SUPABASE_SERVICE_ROLE_KEY`      | Supabase → Settings → API → service_role key |
