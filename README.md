# Blog Application

A modern blog application built with Next.js, Better Auth, and Neon Database.

## Features

- 🔐 Authentication with Better Auth (email/password)
- 👥 Role-based access control (User, Admin, SuperAdmin)
- 📝 Admin dashboard for creating and managing blog posts
- 🔄 Visual flow scripting system (n8n-style automation)
- 🐍 Python backend for flow execution (Modal)
- 🔍 Integrated search for docs and blog posts
- 🎨 Beautiful UI with Tailwind CSS and Fumadocs
- 💾 PostgreSQL database with Neon
- 🚀 Built on Next.js 15

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Neon database URL
   - Generate a secret key for Better Auth

3. Push database schema:
```bash
npm run db:push
```

4. Run development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## Usage

### First Time Setup

1. Go to `/sign-up` to create an account
2. Sign in at `/sign-in`
3. Set your account as Admin:
   ```bash
   npm run set-admin your@email.com Admin
   ```
4. Access admin dashboard at `/admin`
5. Create your first blog post

### User Roles

- **User**: Default role, can view published blog posts
- **Admin**: Can access admin dashboard and manage blog posts
- **SuperAdmin**: Full access (same as Admin currently)

To change a user's role:
```bash
npm run set-admin <email> <role>
# Example: npm run set-admin user@example.com Admin
```

### Admin Dashboard (Admin/SuperAdmin only)

- `/admin` - View all posts
- `/admin/posts/new` - Create new post
- `/admin/posts/[id]/edit` - Edit existing post
- `/admin/scripts` - Flow scripts dashboard
- `/admin/scripts/[uuid]` - Visual flow editor

### Public Pages

- `/` - Home page
- `/blog` - Blog listing with sidebar navigation (published posts only)
- `/blog/[slug]` - Individual blog post
- `/docs` - Documentation pages
- Search bar includes both docs and blog posts

## Database Scripts

- `npm run db:generate` - Generate migrations
- `npm run db:push` - Push schema to database (includes OAuth tables)
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio

## Flow Scripts

Visual workflow automation system for creating backend flows. See [FLOW_SCRIPTS_SETUP.md](FLOW_SCRIPTS_SETUP.md) for detailed setup instructions.

## OAuth 2.0 System

Secure OAuth 2.0 implementation for third-party integrations:

- **Authorization Code Grant**: Standard OAuth flow
- **Refresh Token Support**: Long-lived access
- **Rate Limiting**: 100 API requests/min, 10 token requests/min
- **Secure Token Management**: SHA-256 hashed secrets
- **Admin Interface**: Manage apps at `/admin/oauth`
- **Full Documentation**: Available at `/docs/oauth-integration`

See [OAUTH_SETUP.md](OAUTH_SETUP.md) for setup instructions.

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: Better Auth + Better Auth UI
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Flow Editor**: ReactFlow
- **Backend Execution**: Python + Modal
