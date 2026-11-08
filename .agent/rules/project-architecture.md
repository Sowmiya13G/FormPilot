# Project Architecture Rules — Registration Management Platform

These architectural rules are mandatory for all agents and developers working on this project.

## 1. Core Technology Stack
- **Framework**: Next.js App Router (Next.js 16+), React 19.
- **Language**: TypeScript (strict type checking enabled).
- **Styling**: Tailwind CSS v4.
- **Database & ODM**: MongoDB with Mongoose.
  - **STRICT PROHIBITION**: Do NOT use PostgreSQL, Prisma, TypeORM, Drizzle, or any SQL database. MongoDB with Mongoose is mandatory.
- **Authentication**: Auth.js (NextAuth.js v5) with Google OAuth provider and verified email allowlist.
- **Validation**: Zod for all client and server boundary validations.
- **Integrations**: Google Workspace APIs (Sheets, Drive, Gmail) via official `googleapis` SDK.

## 2. Directory Structure & Organization
All code must follow the standard structure under `src/`:
```text
src/
├── app/                  # Next.js App Router routes
│   ├── (admin)/          # Protected admin panel routes (Dashboard, Templates, Components, Email, Users, Settings)
│   ├── (auth)/           # Authentication routes (login, unauthorized)
│   ├── (public)/         # Public form preview and direct registration routes
│   └── api/              # Route handlers (admin, public, integrations, health)
├── components/           # Reusable UI components
│   ├── dynamic-form/     # Dynamic form renderer for preview & direct web mode
│   ├── email/            # Email preview and template components
│   ├── form-builder/     # Drag-and-drop template designer & field configurator
│   ├── layout/           # Sidebar, header, navigation, admin shell
│   └── ui/               # Base primitives (button, modal, inputs, badges)
├── features/             # Feature-specific hooks, state, and domain logic
├── lib/                  # Shared utilities and server libraries
│   ├── auth/             # Session helpers, auth options, RBAC checks
│   ├── db/               # Mongoose singleton connection (`mongoose.ts`)
│   ├── google/           # Google Drive, Google Sheets, Gmail API adapters
│   ├── html-export/      # Standalone HTML bundle generator
│   ├── security/         # Formula injection, sanitization, crypto helpers
│   └── validations/      # Zod schemas for all models, inputs, and APIs
├── models/               # Mongoose schemas & models (User, Component, Template, Registration, Campaign, Integration, AuditLog)
└── types/                # Shared TypeScript interfaces and type definitions
```

## 3. Server vs. Client Isolation & Secrets Safety
- **Public vs Admin Isolation**: Admin routes (`(admin)/*`, `/api/components`, `/api/templates`, etc.) require active session and RBAC authorization.
- **Zero Leaks in Standalone HTML**: The standalone HTML generator must **NEVER** embed secrets (MongoDB URI, Google client secrets, OAuth tokens, API private keys). The standalone form communicates only with the public submission endpoint (`/api/public/registrations`).
- **Encrypted Credentials**: All OAuth tokens and integration credentials stored in MongoDB must be encrypted at rest using AES-256-GCM.
- **No Mock Placeholders**: Never write fake integration buttons or hollow placeholder screens. Implement real flows, error states, and connection verification.

## 4. Database Connection Pattern
- Use a single, cached Mongoose connection (`lib/db/mongoose.ts`) to avoid socket leaks in Next.js serverless/Turbopack dev environments.
- Ensure all models are registered cleanly with `mongoose.models[ModelName] || mongoose.model(...)`.
- Include database indexes as specified (unique email, unique component key, unique template slug, unique idempotency key).

