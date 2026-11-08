# Phase 1: Project Foundation, MongoDB, Mongoose, Authentication & Admin Layout

## 1. Objectives & Scope
Establish the core architectural foundation for the Registration Management Platform:
- Ensure the project structure adheres strictly to Next.js App Router conventions under `src/`.
- Establish a resilient, cached Mongoose singleton connection to MongoDB.
- Configure Auth.js (NextAuth.js v5) with Google OAuth provider and verified email allowlist enforcement.
- Implement the primary responsive admin layout containing the six main navigation sections:
  1. Dashboard
  2. Registration Templates
  3. Components
  4. Send Email
  5. Users
  6. Settings
- Implement public vs. admin route protection middleware.

---

## 2. Target File Structure
```text
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx                # Admin shell (sidebar, topbar, user menu)
│   │   └── dashboard/
│   │       └── page.tsx              # Initial dashboard with summary cards & links
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Clean login page with Google Sign-In button
│   │   └── unauthorized/
│   │       └── page.tsx              # Access denied notice for non-allowlisted emails
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # Auth.js route handlers
│   │   └── health/
│   │       └── route.ts              # System health & DB connection test
│   ├── globals.css
│   └── layout.tsx                    # Root HTML layout with fonts & providers
├── components/
│   ├── layout/
│   │   ├── AdminSidebar.tsx          # Navigation sidebar with active state
│   │   ├── AdminHeader.tsx           # Header bar with user profile, role badge & logout
│   │   └── SessionProvider.tsx       # NextAuth client session wrapper
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Badge.tsx
├── lib/
│   ├── auth/
│   │   └── index.ts                  # NextAuth configuration, callbacks & session helpers
│   └── db/
│       └── mongoose.ts               # Mongoose singleton connection with caching
├── models/
│   └── User.ts                       # Mongoose User schema & model
├── types/
│   └── index.ts                      # Shared TypeScript definitions
└── middleware.ts                     # Protects (admin)/* routes; redirects unauthenticated users
```

---

## 3. Step-by-Step Tasks

### Step 1.1: Dependency Installation & Environment Configuration
- Install required foundational dependencies:
  - `mongoose`
  - `next-auth@beta`
  - `lucide-react` (icons)
  - `clsx`, `tailwind-merge`
- Create `.env.example` with required keys:
  - `MONGODB_URI`
  - `AUTH_SECRET`
  - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
  - `INITIAL_ADMIN_EMAILS` (comma-separated list of bootstrap admin emails)
  - `NEXT_PUBLIC_APP_URL`

### Step 1.2: MongoDB Connection Utility (`lib/db/mongoose.ts`)
- Implement cached global connection pattern to reuse MongoDB connection across hot reloads and serverless executions.
- Provide connection error logging and retry logic.

### Step 1.3: User Schema (`models/User.ts`)
- Define `User` Mongoose schema with fields:
  - `email` (string, unique, lowercase, trimmed, indexed)
  - `name` (string)
  - `image` (string, optional)
  - `role` (enum: `'ADMIN'`, `'EDITOR'`, `'VIEWER'`, default: `'VIEWER'`)
  - `active` (boolean, default: true)
  - `authProvider` (string, default: `'google'`)
  - `providerSubject` (string)
  - `lastLoginAt` (date)
  - `createdBy` (string)
  - Timestamps (`createdAt`, `updatedAt`)

### Step 1.4: Auth.js Google OAuth Setup & Allowlist Check (`lib/auth/index.ts`)
- Configure Google Provider.
- In the `signIn` callback:
  1. Normalize email to lowercase.
  2. Check if user email is in `INITIAL_ADMIN_EMAILS`. If so and user does not exist in DB, automatically create with role `'ADMIN'`.
  3. If user exists in DB: verify `active === true`. If inactive, deny sign-in.
  4. If user not in DB and not in `INITIAL_ADMIN_EMAILS`: deny sign in (redirect to `/unauthorized`).
- In `session` and `jwt` callbacks:
  - Append `userId` and `role` to `session.user`.

### Step 1.5: Middleware Protection (`middleware.ts`)
- Intercept requests matching `/(admin)/:path*` or `/api/(components|templates|users|settings|email)/:path*`.
- Redirect unauthenticated users to `/login`.
- Allow public API routes (`/api/public/*`, `/api/auth/*`, `/api/health`) without session requirement.

### Step 1.6: Admin Shell Layout & Navigation
- Build `AdminSidebar` with links:
  - Dashboard (`/dashboard`)
  - Registration Templates (`/registration-templates`)
  - Components (`/components`)
  - Send Email (`/send-email`)
  - Users (`/users`)
  - Settings (`/settings`)
- Build `AdminHeader` showing user avatar, name, role badge (`Admin`/`Editor`/`Viewer`), and sign-out button.
- Create initial Dashboard screen displaying:
  - Welcome banner with platform workflow description.
  - KPI cards: Total Templates, Published Forms, Registrations, Sent Campaigns.
  - Quick Action buttons: "Create Template" and "Manage Components".

---

## 4. Acceptance Criteria
- [ ] Mongoose connects successfully to MongoDB and logs status via `/api/health`.
- [ ] Users with emails in `INITIAL_ADMIN_EMAILS` are auto-seeded with `'ADMIN'` role on first Google login.
- [ ] Non-allowlisted users are redirected to `/unauthorized` with a clear explanation.
- [ ] Inactive users cannot log in even with valid Google accounts.
- [ ] Protected admin routes redirect unauthenticated users to `/login`.
- [ ] Admin layout displays all six menu items with active link indicators and responsive mobile drawer.
- [ ] Production build (`npm run build`) succeeds without TypeScript or ESLint errors.

