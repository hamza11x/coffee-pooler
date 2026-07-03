<h1 align="center">
  <br/>
  🎱 ARNADA POOL
  <br/>
</h1>

<p align="center">
  <strong>A full-stack billiards cafe management platform</strong><br/>
  Tournament management · Player profiles · Live match tracking · Admin control
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/NextAuth-Auth-purple" />
  <img src="https://img.shields.io/badge/Three.js-3D-black?logo=threedotjs" />
</p>

---

## Overview

**ARNADA POOL** is a luxury billiards cafe web app built with Next.js. It provides a complete digital experience for both players and staff — from user registration with email verification, to live tournament bracket management and an immersive 3D hero scene.

## Features

### 🏆 Tournament System
- Create, manage, and track tournaments with custom rules
- Auto-generate match brackets when a tournament starts
- Live match scoring and winner declaration from the Admin Dashboard
- Public tournament intel page showing live, upcoming, and completed matches
- Support for multiple gameplay modes and rounds-per-match settings

### 👤 User Accounts
- Secure registration with **email verification** (SMTP via Gmail or Outlook)
- JWT-based authentication via **NextAuth.js**
- Role-based access: `USER`, `STAFF`, `ADMIN`, `OWNER`, `DEV`
- Player profiles with stats tracking and username/password updates
- Rate-limited login (10 attempts / 10 minutes per IP)

### 🛡️ Admin Dashboard
- Collapsible sidebar with role-aware navigation
- Full tournament CRUD (create, edit, start, delete)
- Bracket arena view with per-match player assignment and score sync
- User management table (edit roles, delete accounts) — Master roles only
- **Offline Mode**: Spin-wheel roulette to randomly draw players for live matchups with no internet dependency. Syncs to cloud when online.

### 🌐 Public Pages
- Animated hero with interactive **3D billiards scene** (Three.js + Rapier physics)
- About, features, and ranking sections on the homepage
- Tournament Intel page with real-time match tracking
- Bilingual support (English / French) via `useTranslation`

### ✨ UI / UX
- Dark luxury aesthetic with gold (`#D4AF37`) and cyan (`#00f3ff`) accent colors
- Custom animated cursor
- Framer Motion page transitions and scroll-driven animations
- GSAP animations for hero elements
- 3D loading screen using `@react-three/drei`
- Toast notifications and confirmation dialogs via `ToastProvider`
- Fully responsive — mobile sidebar with hamburger menu

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Framer Motion, GSAP |
| 3D | Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier` |
| Auth | NextAuth.js v4 (Credentials provider, JWT sessions) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma v7 |
| Email | Nodemailer (SMTP) |
| State | Zustand |
| Icons | Lucide React |
| Security | bcryptjs, HTTP security headers, CSRF protection |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for SMTP

### 1. Clone the repository

```bash
git clone https://github.com/hamza11x/coffee-pooler.git
cd coffee-pooler
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See [`.env.example`](.env.example) for all required variables with descriptions.

### 4. Set up the database

Push the Prisma schema to your Supabase project:

```bash
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

All variables are documented in [`.env.example`](.env.example). The required ones are:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | Your app's base URL |
| `SMTP_USER` | Email address for sending verification emails |
| `SMTP_PASS` | App password for the SMTP email account |

---

## Project Structure

```
src/
├── app/
│   ├── admin/dashboard/      # Admin control panel (role-gated)
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   ├── admin/            # Admin-only API routes
│   │   ├── register/         # Registration + email verification
│   │   ├── profile/          # Profile & stats APIs
│   │   ├── tournaments/      # Public tournament data
│   │   ├── offline/          # Offline tournament state sync
│   │   ├── verify-email/     # Email token verification
│   │   └── setup-dev/        # One-time dev account setup (delete in production)
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── profile/              # User profile page
│   ├── tournaments/          # Public tournament intel
│   └── verified/             # Email verified confirmation
├── components/
│   ├── three/                # 3D scene components (HeroScene, PoolTable, BilliardBall)
│   ├── Navbar.js             # Responsive navigation
│   ├── Hero.js               # Landing hero section
│   ├── About.js              # About section
│   ├── Footer.js             # Site footer
│   ├── LoadingScreen.js      # 3D animated loading screen
│   ├── OfflineRoulette.js    # Offline spin-wheel matchmaking
│   ├── ToastProvider.js      # Global notifications & confirmations
│   └── TransitionLink.js     # Animated page navigation
└── lib/
    ├── supabase.js           # Supabase client (public)
    ├── supabaseAdmin.js      # Supabase admin client (server)
    ├── prisma.js             # Prisma client singleton
    ├── rateLimit.js          # In-memory IP rate limiting
    ├── store.js              # Zustand global store
    ├── translations.js       # EN/FR translation strings
    └── useTranslation.js     # Translation hook
```

---

## User Roles

| Role | Access |
|---|---|
| `USER` | Register, join tournaments, view profile |
| `STAFF` | Admin dashboard (tournaments tab only) |
| `ADMIN` | Full admin dashboard |
| `OWNER` | Admin dashboard + user management |
| `DEV` | Full system access |

---

## Security

- Passwords are hashed with **bcryptjs** (10 salt rounds)
- Sessions use **HTTP-only, SameSite cookies**
- Login is **rate-limited** per IP (10 attempts / 10 min)
- All sensitive HTTP headers are set in `next.config.mjs`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy`
  - `Referrer-Policy`
  - `Permissions-Policy`

> ⚠️ The `/api/setup-dev` endpoint should be **deleted** before deploying to production.

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

This project is private and built for **ARNADA POOL Cafe**. All rights reserved.
