# TeamUp

A platform for builders to connect, form teams, and build together. Built with Next.js 16, Supabase, and TypeScript.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database/Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Deployment**: Vercel

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase account
- Vercel account (for deployment)

## Local Development

### 1. Clone and Install

```bash
git clone <repository-url>
cd teamup
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | Yes |
| `NEXT_PUBLIC_SITE_URL` | Site origin (e.g., `http://localhost:3000`) | Yes |
| `INVITATION_TOKEN_SECRET` | Random string for invitation token signing | Yes |

Optional:

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin tasks (server-only) |

### 3. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run migrations in order:
   ```bash
   # In Supabase SQL Editor, run each migration file:
   # 001_initial_schema.sql
   # 002_storage_setup.sql
   # 003_enable_notifications_realtime.sql
   # 004_add_user_skills_proficiency.sql
   # 005_team_workspace.sql
   # 006_team_resources.sql
   # 007_security_rls_audit.sql
   ```
3. Enable Realtime for `notifications` table (handled by migration 003)
4. Configure Storage buckets (handled by migration 002): `avatars` (public), `team_documents` (private)
5. In Authentication > Settings:
   - Set Site URL to your `NEXT_PUBLIC_SITE_URL`
   - Add redirect URLs for auth callbacks

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Production Build

```bash
npm run build
npm run start
```

## Vercel Deployment

### 1. Connect Repository

Import the repository in Vercel (https://vercel.com/new).

### 2. Configure Environment Variables

Add all variables from `.env.example` in Vercel Project Settings > Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (your production URL, e.g., `https://teamup.vercel.app`)
- `INVITATION_TOKEN_SECRET` (generate a secure random string)

### 3. Deploy

Vercel will automatically detect Next.js and deploy. The build command is `npm run build`.

### 4. Post-Deployment

1. Update Supabase Auth settings with production URL
2. Verify realtime works (notifications)
3. Test team creation, applications, invitations

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, signup, onboarding)
│   ├── actions/           # Server Actions (mutations)
│   ├── api/               # API routes (minimal, auth callback only)
│   ├── dashboard/         # User dashboard
│   ├── profile/           # Profile view/edit
│   ├── teams/             # Team explore, detail, workspace
│   ├── applications/      # User applications
│   └── notifications/     # Notifications
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── teams/            # Team-specific components
│   ├── profile/          # Profile components
│   ├── applications/     # Application components
│   └── notifications/    # Notification components
├── lib/
│   ├── supabase/         # Supabase clients (server, client, middleware)
│   └── matching/         # Team-user matching algorithm
├── types/                # TypeScript types
└── validations/          # Zod schemas
```

## Key Features

- **Authentication**: Supabase Auth with SSR session management
- **Profiles**: Skills (with proficiency), interests, availability, social links
- **Teams**: Create, edit, delete, roles, capacity, track (technical/community)
- **Applications**: Apply to roles, leader review, accept/reject/withdraw
- **Invitations**: Leader sends, invitee accepts/rejects, secure tokens
- **Workspace**: Tasks (Kanban), resources, member contacts (GitHub/LinkedIn/Portfolio)
- **Matching**: Skill/interest-based match scoring
- **Notifications**: Realtime with mark-as-read

## Security

- Row Level Security (RLS) on all tables
- Server Actions enforce authorization (never trust client)
- Team ownership via `leader_id` (not `owner_id`)
- No service-role key in client code
- Input validation via Zod schemas

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |

## License

MIT