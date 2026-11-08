# Registration Management Platform — Master Implementation Roadmap

This document outlines the end-to-end execution roadmap to build the Registration Management Platform phase-by-phase.

## Project Vision & Core Goal
Eliminate manual HTML/CSS/JS form creation for client events by providing a web-based Next.js platform that allows administrators to:
1. Build reusable form components.
2. Assemble dynamic event registration forms with conditional logic.
3. Export standalone, single-file HTML registration pages that run anywhere without server runtime dependencies.
4. Ingest registrations securely into MongoDB, Google Sheets, and Google Drive.
5. Compose and send branded invitation emails with clickable banners via the Gmail API.

---

## Tech Stack Quick Reference
- **Frontend / Fullstack**: Next.js App Router (Next 16+), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database & ODM**: MongoDB with Mongoose (NO PostgreSQL, NO Prisma)
- **Auth**: Auth.js (NextAuth v5) + Google OAuth + Initial Email Allowlist
- **Form Engine**: React Hook Form (Admin), Vanilla JS Engine (Exported HTML), Zod (Validation)
- **Integrations**: Google Sheets API, Google Drive API, Gmail API (`googleapis`)
- **Testing**: Vitest + Playwright

---

## Phase Progression & Tracking Table

| Phase | Phase Name | Status | Key Deliverable | Task Document |
|:---:|:---|:---:|:---|:---|
| **01** | Foundation, Database & Admin Layout | ✅ Completed | Next.js setup, Mongoose connection, Google OAuth, Admin Shell | [Phase 1](./phase-01-foundation-auth-layout.md) |
| **02** | User Management & Role-Based Access Control | ✅ Completed | User model, initial admin seed, allowlist, Admin/Editor/Viewer RBAC | [Phase 2](./phase-02-user-management-rbac.md) |
| **03** | Component Library CRUD | ✅ Completed | 15 field types, component manager UI, validation settings | [Phase 3](./phase-03-component-library.md) |
| **04** | Template Builder & Conditional Field Engine | ✅ Completed | Form builder UI, drag & drop, conditional logic rules engine | [Phase 4](./phase-04-template-builder-conditional-engine.md) |
| **05** | Wonderla BANDHAN 13.2 Master Template | ✅ Completed | Wonderla reference template, repeatable kids (max 3), ticket logic | [Phase 5](./phase-05-wonderla-reference-template.md) |
| **06** | Standalone HTML Exporter & Form Preview | ✅ Completed | Standalone HTML generator, pure CSS/JS runtime, file download | [Phase 6](./phase-06-standalone-html-exporter.md) |
| **07** | Public Registration API & Idempotency | ✅ Completed | `/api/public/registrations`, Zod schema, idempotency, MongoDB storage | [Phase 7](./phase-07-public-registration-api.md) |
| **08** | File Storage & Private Google Drive Integration | ⏳ Pending | Event Drive folder, private ID file upload, secure admin proxy | [Phase 8](./phase-08-google-drive-integration.md) |
| **09** | Google Sheets Integration & Dynamic Mapping | ⏳ Pending | Header-name column mapping, right-append, formula protection | [Phase 9](./phase-09-google-sheets-integration.md) |
| **10** | Email Campaign Composer & Gmail Integration | ⏳ Pending | Gmail API send, clickable banner, fallback text, campaign logs | [Phase 10](./phase-10-email-composer-gmail.md) |
| **11** | Settings, Integrations Hub & Audit Logging | ⏳ Pending | Settings UI, integration test buttons, audit logs, credential crypto | [Phase 11](./phase-11-settings-integrations-audit.md) |
| **12** | Security Hardening & Automated Testing | ⏳ Pending | Rate limiting, CORS, CSRF, Vitest, Playwright, production build | [Phase 12](./phase-12-security-hardening-testing.md) |

---

## Phase Execution Protocol
1. **Sequential Execution**: Complete each phase in order. Do not skip to later integration phases before the foundation and data schemas are locked.
2. **Real Implementations Only**: Never create stub mock handlers or fake buttons. All API routes and UI controls must perform real actions or handle errors cleanly.
3. **Validation at Every Step**: Validate changes with `npm run build` and tests before transitioning to the next phase.

