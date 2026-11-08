# Domain Workflows & Business Logic Rules

Rules governing core business workflows, form building, integrations, and the master reference specification.

## 1. Wonderla BANDHAN 13.2 Master Reference Specification
The platform must implement the Wonderla BANDHAN 13.2 event form as its primary benchmark and seed template:

### Required Fields & Rules
1. **Personal Details**:
   - `Customer / Employee Name`: Text, Required.
   - `Company Name`: Text, Required.
   - `Designation`: Text, Required.
   - `Email`: Email, Required, valid email format.
   - `Mobile Number`: Tel, Required, regex: `^[6-9]\d{9}$` (valid 10-digit Indian mobile starting with 6-9). Store as text in Google Sheets to avoid scientific notation or dropped leading zeros.
   - `Cab Required`: Radio (Yes / No), Required.
   - `Pickup Address`: Textarea, Required ONLY IF `Cab Required == 'Yes'`.

2. **Spouse / Partner Details**:
   - `Spouse / Partner Name`: Text, Optional.
   - Conditional trigger: If `Spouse / Partner Name` is not empty, spouse is attending:
     - Show `Spouse ID Card` upload.
     - Show `Spouse Height Eligibility` (default: `ABOVE 75 CM`).
     - Show `Spouse Ticket Required` (Yes / No).
     - Make `Spouse ID Card` mandatory when attending.

3. **ID Card Uploads**:
   - `Employee ID Card`: File upload, Required.
   - `Spouse / Partner ID Card`: File upload, Required if spouse attends.
   - Accepted file types: `.jpg`, `.jpeg`, `.png`, `.pdf`.
   - Max file size: 5 MB per file.
   - Target storage: Event-specific Google Drive folder (private, never public links).

4. **Children / Kids Details**:
   - `Are you bringing kids?`: Radio (Yes / No), Required.
   - If Yes, dynamic repeatable child blocks:
     - Maximum kids allowed: **3**.
     - Each child entry fields:
       - `Child Name`: Text, Required.
       - `Age`: Number, Required, whole number 0–17.
       - `Height Eligibility`: Select (`ABOVE 75 CM` / `BELOW 75 CM`), Required.
       - `Ticket Required`: Radio (Yes / No), Required.
   - If No, child block is hidden and child data is cleared.

5. **Ticket Summary Calculation**:
   - Live client-side calculation & strict server-side recalculation:
     ```text
     Total Tickets = (Employee Ticket Required == 'Yes' ? 1 : 0)
                   + (Spouse Attending && Spouse Ticket Required == 'Yes' ? 1 : 0)
                   + (Sum of Kids where Ticket Required == 'Yes')
     ```
   - Summaries: Kids Above 75 CM count, Kids Below 75 CM count, Total Wonderla Tickets.
   - Server must never blindly trust client totals; it recalculates and overwrites them.

---

## 2. Standalone HTML Export Requirements
- **Independent Execution**: Standalone HTML files must run cleanly in any browser hosted on static servers (Apache, Nginx, S3, Netlify, client web servers) without Next.js runtime.
- **Embedded Assets**:
  - Embedded CSS reset and responsive layout styling.
  - Vanilla JavaScript for field validation, conditional visibility engine, live ticket summary, dynamic child section add/remove, and AJAX/Fetch form submission.
- **Security Safeguards**:
  - Zero server secrets or database credentials inside the HTML.
  - Submits to public API URL (`/api/public/registrations`).
  - Idempotency key generation (UUIDv4) upon form load to prevent double submissions.
  - Visual loading spinner, disable button during submit, and clear success/failure overlays.

---

## 3. Integrations Workflow Rules

### Google Sheets Integration:
- Map form field keys to spreadsheet header column names.
- Always locate columns by header name, NEVER hardcode column index.
- If a form field is mapped to a header that does not exist in the sheet, append the header at the first available column on the right.
- Never reorder, rename, or delete existing user columns.
- Prevent duplicate row insertion via idempotency key checks.
- Prepend formula characters (`=`, `+`, `-`, `@`) with `'`.

### Google Drive Integration:
- Root folder configured in settings; each event template has its own designated or auto-created folder.
- Save files using unique filenames: `{eventName}_{registrationId}_{fieldKey}_{timestamp}.{ext}`.
- Store file metadata (Drive File ID, filename, mime type, size, upload timestamp) in MongoDB.
- Files remain private; only authorized admin users can view or download through the authenticated admin proxy endpoint (`/api/registrations/:id/files/:fileId`).

### Gmail Integration:
- Send emails via the authorized Gmail API account so messages appear in the admin's Sent folder.
- Support clickable banner opening the event registration URL.
- Support fallback text if images are blocked by email clients.
- Handle BCC/individual sending to protect recipient privacy (prevent leaking attendee email list).
- Save campaign logs (status, recipient counts, sent timestamp, error details).

---

## 4. Role-Based Access Control (RBAC)
- **Admin**: Full system access (User management, Settings, Components, Templates, Email, Registrations).
- **Editor**: Can manage Components, Templates, Email campaigns, and view Registrations. Cannot modify Users or global Integration credentials.
- **Viewer**: Read-only access to Dashboard, Templates, Components, and Registrations.
- RBAC must be strictly validated on server routes before any mutating operation.

