# Phase 8: Secure File Upload & Private Google Drive Integration

## 1. Objectives & Scope
Implement secure file storage and Google Drive integration:
- Upload employee and spouse ID cards (and custom file inputs) directly to event-specific Google Drive folders.
- Reject invalid file formats (allow only JPG, JPEG, PNG, PDF) and files exceeding 5 MB.
- Store file metadata (Google Drive file ID, unique filename, MIME type, size) in MongoDB.
- Ensure all uploaded documents remain private—never generate or return public direct Drive download URLs to client browsers.
- Provide a secure, authenticated admin proxy endpoint (`/api/registrations/:id/files/:fileId`) allowing authorized admins to view and download documents.

---

## 2. Target File Structure
```text
src/
├── api/
│   ├── integrations/
│   │   └── google/
│   │       └── drive/
│   │           ├── folders/
│   │           │   └── route.ts       # List/create event folders in Google Drive
│   │           └── test/
│   │               └── route.ts       # Test Drive API connection
│   └── registrations/
│       └── [registrationId]/
│           └── files/
│               └── [fileId]/
│                   └── route.ts       # Secure admin file download proxy
├── lib/
│   └── google/
│       ├── auth.ts                    # Google OAuth2 client & token refresh adapter
│       └── drive.ts                   # Google Drive file upload & folder manager
└── models/
    └── Integration.ts                 # Stores encrypted OAuth credentials & folder IDs
```

---

## 3. Step-by-Step Tasks

### Step 8.1: Google Auth Client Adapter (`src/lib/google/auth.ts`)
- Initialize `google.auth.OAuth2` using `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI`.
- Implement function `getAuthenticatedGoogleClient(provider: 'drive' | 'sheets' | 'gmail')`:
  - Retrieves active integration credentials from `Integration` model or environment variables.
  - Decrypts stored refresh token using AES-256-GCM.
  - Attaches token to OAuth2 client with auto-refresh listeners.

### Step 8.2: Google Drive Service Adapter (`src/lib/google/drive.ts`)
- Implement `ensureEventFolder(eventName: string, parentFolderId?: string): Promise<string>`:
  - Checks if a subfolder for this event already exists under the root Drive folder.
  - If not, creates folder via `drive.files.create({ requestBody: { name: eventName, mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId] } })`.
  - Returns the folder ID and updates `RegistrationTemplate.driveFolderId`.
- Implement `uploadFileToDrive(fileBuffer, metadata: { filename, mimeType, folderId }): Promise<DriveFileMetadata>`:
  - Uploads the binary stream to Drive.
  - Ensures permissions remain private (no `anyoneWithLink` permission added).
  - Returns `{ driveFileId, filename, mimeType, size }`.

### Step 8.3: File Validation & Ingestion in Registration Flow
- In `/api/public/registrations`:
  1. For each file uploaded in `FormData` (e.g. `employeeIdCard`, `spouseIdCard`):
     - Check file size (must be > 0 bytes and <= 5 MB).
     - Check extension and MIME type (`image/jpeg`, `image/png`, `application/pdf`).
     - Reject request immediately if file fails checks.
  2. Generate unique filename:
     `${eventSlug}_${registrationId}_${fieldKey}_${Date.now()}.${ext}`
  3. Upload file to event's Google Drive folder asynchronously or inline with timeout.
  4. Record file details in `registration.files`.
  5. Update `registration.driveSyncStatus = 'SYNCED'`.
  6. If Drive fails, set `driveSyncStatus = 'FAILED'` and log error into `integrationErrors` for admin retry.

### Step 8.4: Secure Admin File Download Proxy (`src/app/api/registrations/[registrationId]/files/[fileId]/route.ts`)
- Protected route: requires `requireEditor()` or `requireAdmin()`.
- Fetches registration document; confirms user has permission to view.
- Locates target `fileId` in `registration.files`.
- Streams file from Google Drive via `drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })`.
- Pipes stream to client with headers:
  - `Content-Type: file.mimeType`
  - `Content-Disposition: inline; filename="${file.originalFilename}"`
  - `Cache-Control: private, no-cache`

---

## 4. Acceptance Criteria
- [ ] Uploading valid JPG, PNG, or PDF files uploads them to the designated event folder in Google Drive.
- [ ] Files larger than 5 MB or invalid file extensions are rejected with clear error messages.
- [ ] Uploaded files in Google Drive have restricted permissions (cannot be accessed without admin credentials).
- [ ] No direct Google Drive links are exposed in public API responses or form pages.
- [ ] Authorized admins can view and download submitted ID cards directly from the registration details screen via the proxy route.
- [ ] Failed Drive uploads do not lose registration form data; status is flagged as `'FAILED'` with a retry trigger.

