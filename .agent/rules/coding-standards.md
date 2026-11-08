# Coding Standards & Conventions

Guidelines for writing maintainable, secure, and reliable code across this project.

## 1. Next.js 16+ & React 19 Specifics
- **Asynchronous Route Context**: In Next.js 15 and 16, route parameters (`params`) and `searchParams` in server components and route handlers are Promises. Always `await params` and `await searchParams`.
- **Server and Client Boundaries**:
  - Mark client-interactive components (e.g. form builders, inputs with state, previews) with `'use client'`.
  - Keep data fetching, Mongoose models, and secret access strictly in Server Components, Server Actions, or API Route Handlers.
- **Next.js Breaking Changes**: Check `node_modules/next/dist/docs/` when using newly updated App Router APIs. Never downgrade or introduce deprecated APIs.

## 2. API Design & Zod Validation
- Every route handler (`/api/*`) must:
  1. Validate incoming JSON or FormData with a dedicated Zod schema before processing.
  2. Perform server-side authentication (`auth()`) and permission checking for non-public endpoints.
  3. Return standardized JSON responses:
     - Success: `{ success: true, data: T, message?: string }`
     - Failure: `{ success: false, error: string, details?: any }`
  4. Return appropriate HTTP status codes (200, 201, 400 for bad input, 401 for unauthenticated, 403 for unauthorized, 404 for not found, 409 for conflict/idempotency hit, 500 for server error).

## 3. Form Handling & Conditional Engine Parity
- Dynamic forms in the Next.js preview and the exported standalone HTML must exhibit identical behavior:
  - Required field validations match.
  - Indian mobile number regex: `^[6-9]\d{9}$`.
  - Conditional display rules (operators: `equals`, `notEquals`, `isEmpty`, `isNotEmpty`, `greaterThan`, `lessThan`, `and`, `or`).
  - When a field becomes hidden due to conditional logic, its value must be cleared automatically so hidden data is never submitted.
  - Ticket summary calculations must run dynamically on input changes.

## 4. Security & Sanitization
- **Spreadsheet Formula Injection**: When saving text fields to Google Sheets, prepend any value starting with `=`, `+`, `-`, or `@` with a single apostrophe `'` to prevent formula execution.
- **File Validation**:
  - Validate file extension, MIME type, and size (default max 5 MB).
  - Verify file magic bytes / headers where feasible; reject empty or corrupt files.
- **Origin & CORS Validation**:
  - Public registration endpoints must validate incoming `Origin` / `Referer` headers against the allowed domains configured in the template or global settings.

## 5. Type Safety & Linting
- Strict TypeScript: No `any` types unless strictly necessary for dynamic JSON payload handling, in which case use `unknown` and narrow with Zod or type guards.
- All Mongoose documents must have corresponding TypeScript interfaces exported from `src/types/`.

