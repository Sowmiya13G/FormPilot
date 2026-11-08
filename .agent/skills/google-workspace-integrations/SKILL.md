---
name: google-workspace-integrations
description: >-
  Use this skill when implementing, testing, or troubleshooting Google Sheets, Google Drive,
  and Gmail API integrations, token management, error retry workflows, and spreadsheet column mappings.
---

# Google Workspace Integrations Skill

This skill provides step-by-step guidance for implementing and managing Google Sheets, Google Drive, and Gmail API connections in the Registration Management Platform.

## 1. Authentication & Token Management
All integrations use Google OAuth 2.0 with offline access (`access_type: 'offline'`, `prompt: 'consent'`).

### Required Scopes
- **Google Sheets**: `https://www.googleapis.com/auth/spreadsheets`
- **Google Drive**: `https://www.googleapis.com/auth/drive.file`
- **Gmail**: `https://www.googleapis.com/auth/gmail.send`, `https://www.googleapis.com/auth/gmail.compose`

### Credentials Storage
- Encrypt tokens at rest using AES-256-GCM before saving to MongoDB `Integration` model.
- Automatically refresh expired tokens using `oauth2Client.refreshAccessToken()`.
- Expose connection status and a "Test Connection" button on the Settings page.

---

## 2. Google Sheets Integration Workflow

### Core Principles
1. **Match Columns by Header Name**:
   - Query row 1 of the sheet: `sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!1:1` })`.
   - Map field values to the exact column index matching the field's mapped header.
   - Do NOT assume columns are in fixed alphabetical or numerical order.

2. **Preserve Existing Structure & Append Missing Columns**:
   - If a registration payload contains a field mapped to a header that does not exist in row 1, append the new header name to the rightmost empty column of row 1.
   - Never overwrite, rename, or reorder existing headers.

3. **Formula Injection Sanitization**:
   - Any string starting with `=`, `+`, `-`, or `@` must be prepended with a single quote (`'`) before sending to Google Sheets:
     ```typescript
     export function sanitizeSheetValue(value: unknown): string {
       if (typeof value !== 'string') return String(value ?? '');
       if (/^[=+\-@]/.test(value)) {
         return `'${value}`;
       }
       return value;
     }
     ```

4. **Phone Numbers & Identifiers**:
   - Store Indian mobile numbers with a leading single quote or explicit text format to prevent Sheets from formatting them as numbers or stripping leading characters.

5. **Idempotency & Duplicate Prevention**:
   - Check if the registration's `idempotencyKey` or `registrationId` has already been synced before appending.
   - If a sync fails due to network or rate limiting, mark `sheetsSyncStatus: 'FAILED'` with error details, allowing manual or automated retry.

---

## 3. Google Drive Integration Workflow

### Folder Hierarchy
- Root folder ID is defined in Settings (`GOOGLE_DRIVE_ROOT_FOLDER_ID`).
- Each event template defines or creates its own folder:
  - If `driveFolderId` is not set on template creation, search or create a subfolder named `{Event Name}` inside the root folder.
  - Store the created folder ID in the `RegistrationTemplate` record.

### File Upload Procedure
1. Receive uploaded buffer (Employee ID, Spouse ID, additional documents) via `/api/public/registrations`.
2. Generate sanitized, unique filename:
   ```text
   {EventSlug}_{RegistrationId}_{FieldKey}_{Timestamp}.{ext}
   ```
3. Upload to Google Drive via multipart upload:
   ```typescript
   const driveResponse = await drive.files.create({
     requestBody: {
       name: filename,
       parents: [eventFolderId],
     },
     media: {
       mimeType: file.type,
       body: Readable.from(fileBuffer),
     },
     fields: 'id, name, mimeType, size',
   });
   ```
4. Save file metadata (`driveFileId`, `filename`, `mimeType`, `size`) into the `Registration.files` array.
5. **Private Access**: Do NOT share the file publicly (`anyoneWithLink`). Only authorized admins can download files via authenticated proxy `/api/registrations/:id/files/:fileId`.

---

## 4. Gmail API Integration Workflow

### Sending Emails via Authorized Sender
- Deliver campaign emails directly through the admin's connected Gmail account so messages land in their actual **Sent** folder.
- Compose RFC 2822 MIME message:
  - `To`: Recipient (or individual send loop to avoid disclosing recipient lists).
  - `Subject`: Campaign subject.
  - `Content-Type`: `text/html; charset=utf-8`.
- Encode the raw MIME string with base64url:
  ```typescript
  const encodedMessage = Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  ```
- Send via `gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } })`.

### Banner Image & Alt Text Rules
- Wrap banner in an anchor tag linking to the registration form:
  ```html
  <a href="{{registrationUrl}}" target="_blank" rel="noopener noreferrer">
    <img src="{{bannerImageUrl}}" alt="{{fallbackText}}" style="max-width:100%; height:auto; display:block;" />
  </a>
  ```
- Always include the fallback text or plain-text button directly below the banner so recipients whose email clients block remote images can still register easily.

### Campaign Status & Tracking
- Record `providerMessageIds`, `status` (`DRAFT`, `SENDING`, `SENT`, `FAILED`), recipient counts, sent timestamp, and error details in `EmailCampaign` model.

