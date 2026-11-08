# Phase 11: Settings, Integrations Hub & Audit Logging

## 1. Objectives & Scope
Build the administrative Settings screen and Integration Hub:
- Centralized management for Google OAuth, Google Drive, Google Sheets, and Gmail credentials.
- Test Connection buttons for every integration service with real diagnostic status.
- Configure global defaults (upload max file size, allowed file types, public API URL, email signature, default branding).
- Secure credential management: encrypt tokens at rest with AES-256-GCM; never display full secrets in the UI.
- Audit Log viewer displaying timeline of administrative actions (who changed what and when).

---

## 2. Target File Structure
```text
src/
├── app/
│   ├── (admin)/
│   │   └── settings/
│   │       ├── page.tsx               # Settings tabs (Integrations, Defaults, Branding, Audit Logs)
│   │       └── SettingsClient.tsx     # Client form for settings & test triggers
│   └── api/
│       ├── integrations/
│       │   ├── route.ts               # GET integration status list
│       │   └── google/
│       │       ├── connect/
│       │       │   └── route.ts       # Initiate Google OAuth consent flow for Workspace scopes
│       │       ├── callback/
│       │       │   └── route.ts       # OAuth redirect callback storing encrypted tokens
│       │       └── test/
│       │           └── route.ts       # Test Sheets, Drive, or Gmail connectivity
│       └── audit-logs/
│           └── route.ts               # GET paginated audit log events
├── components/
│   └── settings/
│       ├── IntegrationCard.tsx        # Card showing provider status, last tested date & test button
│       ├── GoogleConnectModal.tsx     # Instructions and launch flow for Google OAuth setup
│       ├── AuditLogTable.tsx          # Filterable event log table
│       └── SystemConfigForm.tsx       # Global defaults form (file size, signature, public API URL)
├── lib/
│   └── security/
│       └── crypto.ts                  # AES-256-GCM token encryption and decryption helpers
└── models/
    ├── Integration.ts                 # Mongoose Integration model
    └── SystemSetting.ts               # Mongoose SystemSetting key-value model
```

---

## 3. Step-by-Step Tasks

### Step 11.1: Token Encryption Utility (`src/lib/security/crypto.ts`)
- Implement AES-256-GCM encryption using `AUTH_SECRET` or dedicated `ENCRYPTION_KEY`:
  ```typescript
  export function encrypt(text: string): { iv: string; content: string; tag: string }
  export function decrypt(hash: { iv: string; content: string; tag: string }): string
  ```
- Protect against storing raw OAuth refresh tokens in plaintext.

### Step 11.2: Integration Model (`models/Integration.ts`)
Define `Integration` schema:
- `provider`: Enum (`'GOOGLE_WORKSPACE'`, `'SMTP'`), unique.
- `ownerEmail`: String.
- `encryptedCredentials`: Object containing encrypted access and refresh tokens.
- `scopes`: Array of strings.
- `status`: Enum (`'CONNECTED'`, `'DISCONNECTED'`, `'ERROR'`).
- `lastTestedAt`: Date.
- `lastTestResult`: Object with diagnostic status.
- `metadata`: Object (e.g. root folder name, default sheet name, sender email).
- Timestamps (`createdAt`, `updatedAt`).

### Step 11.3: Google Workspace OAuth Connection Flow
- `GET /api/integrations/google/connect`:
  - Generates Google OAuth consent URL requesting:
    - `https://www.googleapis.com/auth/spreadsheets`
    - `https://www.googleapis.com/auth/drive.file`
    - `https://www.googleapis.com/auth/gmail.send`
  - Stores state token for CSRF verification.
  - Redirects admin to Google consent screen.
- `GET /api/integrations/google/callback`:
  - Exchanges authorization code for tokens.
  - Encrypts tokens and persists into `Integration` collection.
  - Redirects back to `/settings?connected=true`.

### Step 11.4: Integration Test Endpoints (`/api/integrations/google/test`)
- Tests each service individually:
  - **Drive Test**: Calls `drive.about.get()` and checks root folder accessibility.
  - **Sheets Test**: Calls `sheets.spreadsheets.get()` on default spreadsheet ID.
  - **Gmail Test**: Calls `gmail.users.getProfile({ userId: 'me' })` to verify send capability.
- Updates `Integration.lastTestedAt` and returns structured diagnostic JSON.

### Step 11.5: System Configuration Settings (`models/SystemSetting.ts`)
- Key-value configuration for:
  - `PUBLIC_API_URL`: Base URL used in standalone HTML generation.
  - `UPLOAD_MAX_BYTES`: Default file size cap (default: 5242880 bytes).
  - `ALLOWED_FILE_TYPES`: Default accepted file extensions.
  - `EMAIL_SIGNATURE`: Global HTML email signature.
  - `DEFAULT_BRANDING`: Organization name and logo.

### Step 11.6: Audit Log Viewer (`components/settings/AuditLogTable.tsx`)
- Tab in Settings UI displaying recent admin activity:
  - Timestamp
  - Actor (admin email)
  - Action (e.g., `'TEMPLATE_PUBLISHED'`, `'USER_ROLE_CHANGED'`, `'CREDENTIALS_UPDATED'`)
  - Target Resource
  - Before / After diff popover.

---

## 4. Acceptance Criteria
- [x] Admin can initiate Google Workspace OAuth connection flow and store encrypted tokens.
- [x] Clicking "Test Connection" for Drive, Sheets, and Gmail returns real live diagnostic statuses.
- [x] Sensitive tokens are never displayed in full in responses or UI.
- [x] Global settings (signature, upload size limit, public API URL) persist and take effect across the platform.
- [x] Audit Log records and displays all administrative modifications.

