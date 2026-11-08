# Phase 7: Public Registration API, Idempotency & MongoDB Storage

## 1. Objectives & Scope
Build the public-facing registration ingestion backend:
- Secure endpoint `POST /api/public/registrations` that receives submissions from standalone HTML files or direct links.
- Robust input parsing supporting `multipart/form-data` and JSON.
- Comprehensive server-side validation using Zod.
- Server-side ticket recalculation (never trust totals submitted by the client).
- Idempotency key protection to prevent duplicate entries from network retries or double clicks.
- MongoDB persistence in the `Registration` collection.
- Origin/CORS validation against allowed domains.
- Rate limiting to protect against abuse.

---

## 2. Target File Structure
```text
src/
├── app/
│   ├── (admin)/
│   │   └── registrations/
│   │       ├── page.tsx               # Admin registrations table, search & filters
│   │       └── [registrationId]/
│   │           └── page.tsx           # Registration detail view & sync retry triggers
│   └── api/
│       ├── public/
│       │   ├── templates/
│       │   │   └── [slug]/
│       │   │       └── route.ts       # Public template metadata GET endpoint
│       │   └── registrations/
│       │       └── route.ts           # Public registration POST endpoint
│       └── registrations/
│           ├── route.ts               # Admin GET registrations with pagination & filters
│           └── [registrationId]/
│               └── route.ts           # Admin GET single registration & sync status
├── lib/
│   ├── rate-limit/
│   │   └── index.ts                   # In-memory or Redis-ready IP rate limiter
│   ├── security/
│   │   └── cors.ts                    # CORS header generator checking template.allowedOrigins
│   └── validations/
│       └── registration.ts            # Dynamic Zod schema generator for registration payloads
└── models/
    └── Registration.ts                # Mongoose Registration model
```

---

## 3. Step-by-Step Tasks

### Step 7.1: Registration Mongoose Model (`models/Registration.ts`)
Define `Registration` schema:
- `registrationId`: String, required, unique (e.g. `'REG-BANDHAN-2026-XXXXX'`).
- `templateId`: ObjectId / String, required, indexed.
- `templateVersion`: Number, required.
- `eventName`: String, required.
- `data`: Record / Map of form field keys and user answers (e.g. `employeeName`, `email`, `cabRequired`, `kids`, etc.).
- `files`: Array of uploaded file references:
  - `fieldKey`: String
  - `originalFilename`: String
  - `mimeType`: String
  - `size`: Number
  - `driveFileId`: String (populated in Phase 8)
- `ticketSummary`:
  - `employeeTickets`: Number
  - `spouseTickets`: Number
  - `kidsTickets`: Number
  - `kidsAbove75cm`: Number
  - `kidsBelow75cm`: Number
  - `totalTickets`: Number
- `status`: Enum (`'PENDING'`, `'CONFIRMED'`, `'REJECTED'`), default `'CONFIRMED'`.
- `idempotencyKey`: String, required, unique, indexed.
- `sheetsSyncStatus`: Enum (`'PENDING'`, `'SYNCED'`, `'FAILED'`), default `'PENDING'`.
- `driveSyncStatus`: Enum (`'PENDING'`, `'SYNCED'`, `'FAILED'`, `'SKIPPED'`), default `'PENDING'`.
- `integrationErrors`: Array of `{ service: string, error: string, timestamp: Date }`.
- `sourceOrigin`: String (HTTP Referer / Origin header).
- `ipAddress`: String (masked or hashed for audit).
- Timestamps (`createdAt`, `updatedAt`).

### Step 7.2: Server-Side Recalculation & Validation (`lib/validations/registration.ts`)
- Validate that `templateId` exists and is `PUBLISHED`.
- Verify Indian mobile format `^[6-9]\d{9}$` if mobile field is present.
- If cab is `'Yes'`, ensure `pickupAddress` is not empty.
- If spouse attends, ensure spouse fields are present.
- If kids are included, ensure kid count does not exceed 3, and each kid age is between 0 and 17.
- **Strict Server Recalculation**: Run `calculateTicketSummary(data)` on server and save the result into `ticketSummary`.

### Step 7.3: Public Endpoint `POST /api/public/registrations`
1. **CORS & Origin Check**:
   - Check `req.headers.get('origin')`.
   - If template specifies `allowedOrigins`, ensure origin matches or reject with 403.
2. **Rate Limiting**:
   - Check client IP; enforce maximum 30 requests per minute per IP.
3. **Idempotency Check**:
   - Extract `idempotencyKey` from request.
   - If a registration with this key already exists:
     - Return HTTP 200 with the existing `registrationId` and confirmation message (safe retry).
4. **Data Extraction & Storage**:
   - Parse `FormData`. Extract text fields and file attachments.
   - Generate unique human-readable `registrationId`: `REG-${slug.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`.
   - Persist to MongoDB.
5. **Return Response**:
   - Return HTTP 201:
     ```json
     {
       "success": true,
       "registrationId": "REG-BANDHAN-2026-ABC12",
       "message": "Registration received successfully",
       "ticketSummary": { ... }
     }
     ```

### Step 7.4: Admin Registrations Dashboard View (`app/(admin)/registrations/page.tsx`)
- Table displaying all incoming registrations:
  - Registration ID
  - Event Name
  - Attendee Name & Email
  - Total Tickets badge
  - Sync Status badges (Sheets: Green/Yellow/Red, Drive: Green/Yellow/Red)
  - Submitted Date
- Filter by Event, Search by Name/Email/Mobile, Date range.
- Detail drawer / page displaying all submitted answers, child breakdown, and attached files.

---

## 4. Acceptance Criteria
- [ ] Submitting the standalone HTML form posts to `/api/public/registrations` and creates a document in MongoDB.
- [ ] Duplicate submissions with the same idempotency key are de-duplicated without creating duplicate records.
- [ ] Server recalculates and overrides ticket totals correctly.
- [ ] Invalid mobile numbers or children over age 17 return HTTP 400 with field-specific errors.
- [ ] Admin can view submitted registrations in the admin dashboard.
- [ ] CORS headers are appropriately emitted based on template configuration.

