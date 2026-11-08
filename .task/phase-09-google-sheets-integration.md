# Phase 9: Google Sheets Integration & Dynamic Field Mapping

## 1. Objectives & Scope
Implement Google Sheets synchronization for registration entries:
- Synchronize registration submissions into designated Google Spreadsheets and sheet tabs.
- Flexible field-to-header mapping configured by the admin in the template editor.
- Header matching by column name (never rely on fixed column positions).
- Auto-append missing headers to the right-hand end of Row 1 without disrupting or renaming existing columns.
- Prevent spreadsheet formula injection for values beginning with `=`, `+`, `-`, or `@`.
- Store mobile numbers explicitly as text to prevent dropping leading zeros or scientific notation formatting.
- Idempotency protection to prevent duplicate rows on network retries.
- Support manual and automated retry for failed syncs.

---

## 2. Target File Structure
```text
src/
├── api/
│   ├── integrations/
│   │   └── google/
│   │       └── sheets/
│   │           ├── test/
│   │           │   └── route.ts       # Test Sheets API connection & access
│   │           └── headers/
│   │               └── route.ts       # Fetch existing headers from a spreadsheet
│   └── registrations/
│       └── [registrationId]/
│           └── sync-sheets/
│               └── route.ts           # Trigger manual retry of sheet sync
├── components/
│   └── form-builder/
│       └── SheetMappingConfig.tsx     # Admin UI to map form fields to Sheet header columns
└── lib/
    ├── google/
    │   └── sheets.ts                  # Google Sheets adapter (header matching, append, formula sanitization)
    └── security/
        └── sanitize-sheet.ts          # Formula injection prevention
```

---

## 3. Step-by-Step Tasks

### Step 9.1: Formula Injection Sanitizer (`src/lib/security/sanitize-sheet.ts`)
- Implement sanitization function:
  ```typescript
  export function sanitizeForSheet(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
    // If string begins with =, +, -, or @, prepend with single apostrophe
    if (/^[=+\-@]/.test(str)) {
      return `'${str}`;
    }
    return str;
  }
  ```
- Add helper to format Indian mobile numbers:
  ```typescript
  export function formatPhoneForSheet(phone: string): string {
    const cleaned = phone.trim();
    return cleaned.startsWith("'") ? cleaned : `'${cleaned}`;
  }
  ```

### Step 9.2: Google Sheets Service Adapter (`src/lib/google/sheets.ts`)
- Implement `syncRegistrationToSheet(template, registration)`:
  1. Retrieve target `spreadsheetId` and `sheetTabId` (sheet name) from template config.
  2. Fetch existing headers from Row 1:
     `sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!1:1` })`
  3. Determine column index mapping for each mapped field:
     - Compare template's `sheetMapping` keys with sheet headers.
     - Identify any mapped headers that do NOT exist in the sheet.
  4. If new headers are needed:
     - Append new header strings to row 1 on the right:
       `sheets.spreadsheets.values.append({ spreadsheetId, range: `${sheetName}!1:1`, valueInputOption: 'USER_ENTERED', requestBody: { values: [newHeaders] } })`
     - Refresh cached header list.
  5. Build row array matching header order:
     - For each column in row 1, lookup corresponding form field or system field (`Registration ID`, `Submission Time`, `Ticket Count`, `Drive File Links`).
     - Sanitize value using `sanitizeForSheet`.
  6. Append row:
     `sheets.spreadsheets.values.append({ spreadsheetId, range: `${sheetName}!A:A`, valueInputOption: 'USER_ENTERED', requestBody: { values: [rowValues] } })`
  7. Return success or throw error.

### Step 9.3: Registration Ingestion Integration Hook
- In `/api/public/registrations`:
  - After saving to MongoDB, invoke `syncRegistrationToSheet`.
  - On success: Set `registration.sheetsSyncStatus = 'SYNCED'`.
  - On error:
    - Set `registration.sheetsSyncStatus = 'FAILED'`.
    - Append error message to `registration.integrationErrors`.
    - Do NOT fail the registration response to the end user (the user's submission is securely stored in MongoDB).

### Step 9.4: Retry Sync API (`src/app/api/registrations/[registrationId]/sync-sheets/route.ts`)
- Authenticated endpoint for Admin/Editor:
  - Loads registration and template.
  - Re-executes `syncRegistrationToSheet`.
  - Updates sync status and returns result.

### Step 9.5: Sheet Mapping Configuration UI (`components/form-builder/SheetMappingConfig.tsx`)
- In Template Builder under "Google Sheets" tab:
  - Input: `Spreadsheet ID`
  - Input: `Sheet Tab Name` (default: `'Registrations'`)
  - "Fetch Sheet Headers" button: Connects to Sheets and auto-populates dropdowns.
  - Mapping Table:
    - Form Field (e.g. `employeeName`, `companyName`, `cabRequired`, `pickupAddress`, `kids`, `totalTickets`)
    - Arrow `->`
    - Target Header Column Name (dropdown of existing headers or free text for new header)
  - Pre-load standard Wonderla mapping defaults.

---

## 4. Acceptance Criteria
- [x] Submitting a registration writes a row into the configured Google Sheet matching headers by name.
- [x] If new fields are mapped that do not exist in row 1, they are appended to the right without disrupting existing columns.
- [x] Text values starting with `=`, `+`, `-`, or `@` are safely escaped with `'` and do not execute as formulas.
- [x] Mobile numbers are stored with leading zero intact and do not become scientific notation.
- [x] If Google Sheets API is temporarily offline, registration is saved in MongoDB, flagged as `'FAILED'`, and can be retried via the admin dashboard button.
- [x] Retrying a sync does not create duplicate rows.

