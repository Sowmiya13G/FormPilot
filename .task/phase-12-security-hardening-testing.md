# Phase 12: Security Hardening, Automated Testing & Verification

## 1. Objectives & Scope
Finalize and harden the complete application before delivery:
- Implement comprehensive security controls (CSRF, CORS domain whitelisting, rate limiting, anti-bot protection).
- Validate file security (magic bytes inspection, size limits, private Drive access).
- Implement automated test suites:
  - Unit tests with Vitest (Zod schemas, ticket calculation logic, conditional rules engine, sheet sanitization).
  - Integration tests (API route handlers, idempotency checks, Mongoose model validations).
  - End-to-end tests with Playwright (Admin login, form building, standalone HTML export and submission).
- Verify production build (`npm run build`) and linting (`npm run lint`).
- Complete `README.md`, `SECURITY.md`, and `.env.example`.

---

## 2. Target File Structure
```text
tests/
├── unit/
│   ├── ticket-calculator.test.ts      # Tests adult, spouse, and kid ticket counts
│   ├── conditional-engine.test.ts     # Tests equals, notEquals, isEmpty, and/or rules
│   ├── sanitize-sheet.test.ts         # Tests =, +, -, @ formula injection prevention
│   └── mobile-regex.test.ts           # Tests Indian mobile number validation
├── integration/
│   ├── public-registration-api.test.ts# Tests idempotency, Zod validation, recalculation
│   ├── component-api.test.ts          # Tests component CRUD and unique keys
│   └── template-api.test.ts           # Tests template versioning and publish
└── e2e/
    ├── admin-flow.spec.ts             # Playwright test: navigate dashboard, builder, preview
    └── standalone-form.spec.ts        # Playwright test: standalone HTML submission
.env.example                           # Documented environment variables template
SECURITY.md                            # Security policies, disclosure and data handling guidelines
README.md                              # Local setup and usage guide
```

---

## 3. Step-by-Step Tasks

### Step 12.1: Automated Unit Tests (`tests/unit/*`)
- Install Vitest and test dependencies: `npm install -D vitest @vitejs/plugin-react`.
- Configure `vitest.config.ts`.
- Write unit tests for:
  1. `ticket-calculator.test.ts`:
     - Employee only (1 ticket).
     - Employee + Spouse attending with ticket = Yes (2 tickets).
     - Employee + Spouse attending with ticket = No (1 ticket).
     - Kids logic: 1 kid with ticket, 1 without ticket; heights above/below 75 cm.
     - Maximum 3 kids enforcement.
  2. `conditional-engine.test.ts`:
     - Tests all operators: `equals`, `notEquals`, `isEmpty`, `isNotEmpty`, `greaterThan`, `lessThan`.
     - Tests `matchType: 'all'` vs `'any'`.
     - Tests that clearing hidden field values works correctly.
  3. `sanitize-sheet.test.ts`:
     - Tests strings beginning with `=`, `+`, `-`, `@`.
     - Confirms apostrophe prepending.
     - Confirms normal strings are unmodified.
  4. `mobile-regex.test.ts`:
     - Validates standard Indian numbers (`9876543210`, `7000000000`, `6123456789`).
     - Rejects numbers with length != 10, non-digits, or starting with 0-5.

### Step 12.2: Integration Tests (`tests/integration/*`)
- Test public registration endpoint `/api/public/registrations`:
  - Valid submission returns 201 and stores data in test MongoDB.
  - Submitting twice with the same `idempotencyKey` returns 200 without creating a duplicate record.
  - Server-calculated ticket summary overrides any manipulated client numbers.
  - Submitting from an unapproved origin domain returns 403 Forbidden.
- Test template publish lifecycle:
  - Publishing increments template version.
  - Unpublishing reverts status to `DRAFT`.

### Step 12.3: End-to-End Playwright Tests (`tests/e2e/*`)
- Install Playwright: `npm install -D @playwright/test`.
- Create `tests/e2e/standalone-form.spec.ts`:
  - Renders exported standalone HTML file.
  - Fills in personal details.
  - Selects `Cab Required = Yes` and confirms `Pickup Address` appears.
  - Fills in spouse name and confirms spouse ID upload appears.
  - Adds 2 kids, fills in details, selects ticket options.
  - Verifies live ticket summary counter displays expected count.
  - Submits form and verifies success screen renders.

### Step 12.4: Production Build & Lint Verification
- Run `npm run lint` and resolve any ESLint warnings/errors.
- Run `npm run build` and ensure Next.js App Router compilation completes cleanly with Turbopack.
- Verify no TypeScript type errors (`npx tsc --noEmit`).

### Step 12.5: Documentation & Security Deliverables
- Ensure `.env.example` has clear comments for every variable.
- Create `SECURITY.md` detailing:
  - Role-based access control.
  - Data protection for personal information and government ID cards.
  - Private Google Drive storage policy.
  - Formula injection mitigation.
  - Rate limiting and bot mitigation.
- Update `README.md` with:
  - Project architecture overview.
  - Local development setup instructions.
  - Admin seeding instructions.
  - How to create a form, preview it, and download standalone HTML.

---

## 4. Acceptance Criteria
- [ ] All Vitest unit tests pass (`npm run test:unit`).
- [ ] Integration tests pass against local or test MongoDB.
- [ ] Playwright E2E tests pass for the standalone form flow.
- [ ] `npm run build` succeeds with zero errors.
- [ ] `npm run lint` completes with zero errors.
- [ ] Complete documentation is in place (`README.md`, `SECURITY.md`, `.env.example`).
- [ ] Zero placeholder pages, dead buttons, or mock APIs remain in the codebase.

