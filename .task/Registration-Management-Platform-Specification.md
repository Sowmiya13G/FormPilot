# Registration Management Platform — Complete Project Specification

## 1. Project overview

Build a reusable web-based Registration Management Platform using Next.js.

The main purpose is to avoid manually creating a new HTML, CSS and JavaScript registration form for every client event.

The platform must allow an authorized admin to:

1. Create reusable form components.
2. Create a new event registration form.
3. Select which fields are required for that event.
4. Configure field validations and conditional display.
5. Preview the registration form.
6. Export a complete standalone HTML file.
7. Host that HTML file on any client's website/server.
8. Receive registrations through a secure backend API.
9. Save registration data to MongoDB and Google Sheets.
10. Upload ID documents to event-specific Google Drive folders.
11. Compose and send invitation emails with a clickable banner.
12. Manage authorized users and integrations.

**Important:** The exported HTML must work independently. It must not require the Next.js admin application to be rendered on the client's website.

## 2. Technology stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | Auth.js + Google OAuth |
| Form handling | React Hook Form |
| Validation | Zod |
| Email | Gmail API |
| File storage | Google Drive API |
| Spreadsheet | Google Sheets API |
| HTML export | Custom standalone HTML generator |
| Testing | Vitest + Playwright |

Do not use PostgreSQL or Prisma. MongoDB and Mongoose are mandatory.

## 3. Admin navigation

The application must contain these six main menu items:

```text
Dashboard
Registration Templates
Components
Send Email
Users
Settings
```

### 3.1 Dashboard

Keep it simple initially.

Show:
- Welcome message.
- Short explanation of the platform workflow.
- Total templates.
- Published templates.
- Total registrations.
- Recent email campaigns.
- Quick links to create a template and manage components.

No complicated analytics are required for the first version.

### 3.2 Registration Templates

This is the main form builder.

Admin workflow:

1. Click Create New Template.
2. Enter event name.
3. Enter event description.
4. Add background image URL.
5. Select fields from the Components library.
6. Drag and reorder fields.
7. Set each field as required or optional.
8. Configure validation.
9. Configure conditional display.
10. Preview the form.
11. Save as draft.
12. Publish the form.
13. Download standalone HTML.

Each template should support:

- Event name.
- Unique slug.
- Description.
- Background image URL.
- Logo/banner URL.
- Form theme.
- Field list and ordering.
- Required/optional configuration.
- Conditional rules.
- Validation configuration.
- Google Sheet mapping.
- Google Drive event folder.
- Allowed client website domains.
- Published/draft status.
- Template version.

### 3.3 Components

This section manages reusable form fields.

Admin must be able to:

- Add component.
- Edit component.
- Deactivate component.
- Duplicate component.
- Preview component.
- Search components.
- Configure field type.
- Configure validation.
- Configure default required/optional state.

Supported field types:

```text
Text
Email
Mobile Number
Number
Date
Dropdown
Radio
Checkbox
Checkbox Group
Textarea
File Upload
Hidden Field
Section Heading
Information Text
Repeatable Group
```

Each component should contain:

```text
Component ID
Field Key
Label
Field Type
Placeholder
Help Text
Default Value
Required
Validation Rules
Dropdown Options
Conditional Rules
Maximum Length
Minimum Length
Maximum File Size
Allowed File Types
Active Status
Created Date
Updated Date
```

### 3.4 Send Email

Admin must be able to compose invitation emails.

Fields:

- To
- CC
- BCC
- Subject
- Email body
- Banner image URL
- Registration URL
- Fallback text
- Preview
- Send Test Email
- Send Email

Requirements:

- Banner image should be clickable.
- Clicking the banner must open the registration URL.
- If the banner image does not load, fallback/alt text should be available.
- Admin can manually write the email body.
- Multiple recipient addresses must be supported.
- Email must be sent using the authorized sender's email account.
- Campaign history and send status must be saved.
- Avoid exposing recipients' addresses to each other accidentally.

**Gmail signature note:** Gmail API or SMTP does not automatically append the signature configured in Gmail's web interface. The platform must either save a signature in its own Settings or explicitly retrieve/manage the Gmail send-as signature using supported Gmail settings permissions.

### 3.5 Users

Initially, the application will have two administrator email addresses supplied by the owner.

Do not hardcode passwords.

Use verified Google OAuth login and an email allowlist.

Admin can:

- Add authorized email.
- Edit user.
- Change role.
- Activate/deactivate user.
- View last login.
- Revoke access.

Roles:

| Role | Permissions |
|---|---|
| Admin | Full access |
| Editor | Manage components, templates and campaigns |
| Viewer | Read-only access |

Every protected operation must check the user's role on the server.

### 3.6 Settings

Settings must contain:

- Application configuration.
- Google OAuth connection.
- Google Drive connection.
- Google Sheets connection.
- Gmail connection.
- Default upload size.
- Default file types.
- Public API URL.
- Allowed client domains.
- Email signature.
- Default branding.
- Integration test buttons.
- Audit logs.

Secrets and tokens must never be displayed in full after saving.

---

## 4. Wonderla BANDHAN 13.2 — Master form requirements

The existing Wonderla form is the reference form. Its fields and behavior must be converted into reusable components.

The platform must not force every event to use all these fields. Admin selects only the fields required for each event.

### 4.1 Personal details

| Field | Type | Validation |
|---|---|---|
| Customer / Employee Name | Text | Required |
| Company Name | Text | Required |
| Designation | Text | Required |
| Email | Email | Required, valid format |
| Mobile Number | Tel | Required, valid Indian mobile |
| Cab Required | Radio Yes/No | Required |
| Pickup Address | Textarea | Required only if Cab = Yes |
| Spouse / Partner Name | Text | Optional |

Mobile number validation in the reference:

```regex
^[6-9]\d{9}$
```

### 4.2 ID card uploads

Fields:

- Employee ID Card.
- Spouse / Partner ID Card.

Rules:

- Employee ID Card is required.
- Spouse ID Card is required when spouse/partner attends.
- In the existing form, spouse attendance is determined by whether Spouse / Partner Name is entered.
- Accepted formats: JPG, JPEG, PNG, PDF.
- Maximum file size: 5 MB per file.
- Reject empty files.
- Validate file type and content on the server.
- Upload files into the correct event-specific Google Drive folder.
- ID cards must remain private. Do not make them publicly accessible.

### 4.3 Adult Wonderla ticket details

Employee:

- Employee Height Eligibility.
- Employee Ticket Required — Yes/No.

Spouse:

- Spouse Height Eligibility.
- Spouse Ticket Required — Yes/No.

Spouse fields must only appear when a spouse/partner is attending.

The existing reference treats the employee and spouse height eligibility as `ABOVE 75 CM`. Keep that default for the Wonderla template, but make height eligibility configurable in the reusable form engine.

### 4.4 Kids details

Question:

`Are you bringing kids?` — Yes/No.

If Yes, show child details.

Maximum children: **3**.

Each child must have:

| Field | Type | Validation |
|---|---|---|
| Child Name | Text | Required |
| Age | Number | Whole number, 0–17 |
| Height Eligibility | Select | ABOVE 75 CM / BELOW 75 CM |
| Ticket Required | Yes/No | Required |

Admin should be able to add or remove child blocks up to the configured maximum.

If the answer is No, hide the child section and do not submit old hidden child values.

### 4.5 Ticket summary

Calculate the following:

- Kids above 75 cm.
- Kids below 75 cm.
- Total Wonderla tickets.

Calculation:

```text
Total Tickets =
Employee Ticket (0 or 1)
+ Spouse Ticket (0 or 1)
+ Number of Kids whose Ticket Required = Yes
```

The browser should show a live summary. The server must calculate the totals again and must never trust totals sent by the browser.

The existing Apps Script has these specific validation and calculation rules, including the three-child maximum and ticket summary. Pasted text (2)

### 4.6 Additional reusable fields

The component library must also support occasional fields such as:

- Date of Birth.
- Age.
- Height.
- Employee ID.
- Membership ID.
- Additional attendee details.
- Custom questions.
- Additional document uploads.
- Repeatable family/member details.

These must be configurable, not hardcoded into the Wonderla form alone.

---

## 5. Conditional field engine

The form builder must support conditional visibility.

Examples:

```text
IF Cab Required = Yes
THEN show Pickup Address
AND make Pickup Address required
```

```text
IF Spouse Name is not empty
THEN show Spouse ID Card
AND show Spouse Ticket Details
```

```text
IF Bringing Kids = Yes
THEN show Kids Details
AND require at least one child
```

The conditional engine should support:

- Equals.
- Not equals.
- Is empty.
- Is not empty.
- Greater than.
- Less than.
- AND conditions.
- OR conditions.

When a field becomes hidden, its value should be cleared by default so irrelevant data is not submitted.

---

## 6. Standalone HTML export

This is one of the most important features.

When an admin clicks **Download HTML**, the application must generate one complete HTML file.

The exported file must include:

1. Complete HTML structure.
2. CSS styling.
3. Responsive layout.
4. Background image configuration.
5. Form fields.
6. Required field validation.
7. Conditional field logic.
8. Repeatable child sections.
9. File upload validation.
10. Live ticket summary.
11. Submit button.
12. Loading state.
13. Success message.
14. Error message.
15. Duplicate-submit protection.
16. API submission logic.

The downloaded file must work when uploaded to a normal client website or static hosting server.

It must not depend on the Next.js application's React components or admin login.

### Submission configuration

The generated HTML must submit to an absolute public API URL, for example:

```text
https://your-platform-domain.com/api/public/registrations
```

The actual URL must come from Settings or template configuration.

Never put these inside the exported HTML:

- MongoDB URI.
- Google OAuth secret.
- Gmail credentials.
- Private API tokens.
- Google refresh tokens.
- Drive service-account private keys.

### Submission modes

Support two modes:

**Mode A — Platform API (recommended)**

```text
Standalone HTML
      |
      v
Next.js Public API
      |
      v
MongoDB
      |
      +---- Google Sheets
      |
      +---- Google Drive
```

**Mode B — Existing Apps Script compatibility**

Allow an admin to configure an existing Apps Script endpoint for legacy deployments.

The compatibility mode must be clearly identified and must not expose credentials. The preferred long-term approach is the platform API.

---

## 7. Google Sheets integration

The existing Apps Script saves registration data into Google Sheets.

The new platform must provide equivalent or improved behavior.

Requirements:

- Each event can have its own spreadsheet.
- Each event can have its own sheet/tab.
- Admin can map form fields to spreadsheet headers.
- Match headers by name, not fixed column position.
- Support header aliases.
- Add missing headers at the right-hand end.
- Never rename or move existing headers automatically.
- Prevent duplicate rows on retries.
- Store the spreadsheet sync status.
- Allow failed syncs to be retried.
- Store mobile numbers as text.
- Prevent spreadsheet formula injection.

For example, text beginning with these characters must be handled safely:

```text
=
+
-
@
```

The original Apps Script uses header-name matching, preserves existing columns and adds missing headers on the right. It also uses a lock and request ID cache for duplicate protection. Pasted text (2)

The new platform should implement equivalent protection using database idempotency and safe integration retries.

---

## 8. Google Drive integration

Requirements:

- Configure a root Drive folder.
- Create or select an event-specific folder.
- Store the event folder ID in MongoDB.
- Upload employee ID cards.
- Upload spouse ID cards.
- Support additional file fields.
- Use unique filenames.
- Store Drive file ID, filename, MIME type and size in MongoDB.
- Keep files private.
- Allow authorized admins to view/download documents.
- Do not return private Drive URLs to public registration pages.

Example folder structure:

```text
Registration Platform/
│
├── BANDHAN 13.2/
│   ├── Sowmiya_Employee_ID.pdf
│   ├── Sowmiya_Spouse_ID.jpg
│   └── ...
│
├── Annual Day 2027/
│   ├── ...
│
└── Family Get Together/
    ├── ...
```

The folder names are examples. The platform should create folders based on each event.

---

## 9. Gmail integration

The owner wants emails to be sent from their own email account and appear in Sent mail.

Preferred implementation:

- Gmail OAuth connection.
- Secure token storage.
- Gmail API send.
- Refresh token handling.
- Connection status.
- Test email.
- Campaign send.
- Error logging.
- Retry handling.

Email campaign record should store:

```text
Campaign ID
Subject
Body
Banner URL
Registration URL
Recipients
CC
BCC
Sender
Created By
Created Date
Send Status
Sent Date
Provider Message ID
Error Details
```

Do not send a mass email with every recipient visible in the To field unless the admin explicitly chooses that behavior. Use individual messages or a suitable BCC approach.

---

## 10. MongoDB database design

Use Mongoose models.

### User

```text
email
name
role
active
authProvider
providerSubject
lastLoginAt
createdBy
createdAt
updatedAt
```

### Component

```text
key
label
description
type
category
placeholder
defaultValue
defaultRequired
options
validationConfig
conditionalConfig
active
version
createdAt
updatedAt
```

### RegistrationTemplate

```text
eventName
slug
description
status
version
fields
theme
backgroundImageUrl
bannerImageUrl
publicApiMode
allowedOrigins
driveFolderId
spreadsheetId
sheetTabId
sheetMapping
createdBy
updatedBy
publishedAt
createdAt
updatedAt
```

### Registration

```text
registrationId
templateId
templateVersion
eventName
data
files
ticketSummary
status
idempotencyKey
sheetsSyncStatus
driveSyncStatus
integrationErrors
sourceOrigin
createdAt
updatedAt
```

### EmailCampaign

```text
subject
body
bannerImageUrl
registrationUrl
recipients
cc
bcc
sender
providerMessageIds
status
sentAt
error
createdBy
createdAt
updatedAt
```

### Integration

```text
provider
owner
encryptedCredentials
scopes
status
lastTestedAt
metadata
createdAt
updatedAt
```

### AuditLog

```text
actor
action
resourceType
resourceId
beforeSummary
afterSummary
timestamp
```

Important indexes:

- Unique normalized user email.
- Unique component key.
- Unique template slug.
- Unique registration idempotency key.
- Registration template/date index.
- Email campaign status/date index.

---

## 11. Recommended folder structure

```text
registration-management-platform/
│
├── public/
│   ├── images/
│   └── branding/
│
├── src/
│   │
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── registration-templates/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [templateId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [componentId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── send-email/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── registrations/
│   │   │       ├── page.tsx
│   │   │       └── [registrationId]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── (public)/
│   │   │   └── register/
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── route.ts
│   │   │   │   └── [templateId]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── publish/
│   │   │   │       │   └── route.ts
│   │   │   │       └── export/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── public/
│   │   │   │   ├── templates/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── route.ts
│   │   │   │   └── registrations/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── registrations/
│   │   │   │   ├── route.ts
│   │   │   │   └── [registrationId]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── users/
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   ├── email/
│   │   │   │   └── campaigns/
│   │   │   │       ├── route.ts
│   │   │   │       └── [campaignId]/
│   │   │   │           └── send/
│   │   │   │               └── route.ts
│   │   │   │
│   │   │   ├── integrations/
│   │   │   │   └── google/
│   │   │   │       ├── connect/
│   │   │   │       ├── callback/
│   │   │   │       └── test/
│   │   │   │
│   │   │   └── health/
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── form-builder/
│   │   ├── dynamic-form/
│   │   └── email/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── templates/
│   │   ├── registrations/
│   │   ├── email/
│   │   ├── users/
│   │   └── integrations/
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   └── mongoose.ts
│   │   ├── auth/
│   │   ├── permissions/
│   │   ├── validations/
│   │   ├── html-export/
│   │   ├── google/
│   │   │   ├── sheets.ts
│   │   │   ├── drive.ts
│   │   │   └── gmail.ts
│   │   ├── email/
│   │   ├── storage/
│   │   ├── rate-limit/
│   │   ├── security/
│   │   └── utils/
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Component.ts
│   │   ├── RegistrationTemplate.ts
│   │   ├── Registration.ts
│   │   ├── EmailCampaign.ts
│   │   ├── Integration.ts
│   │   └── AuditLog.ts
│   │
│   ├── types/
│   └── middleware.ts
│
├── scripts/
│   ├── seed-admins.ts
│   └── migrate-template.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── SECURITY.md
```

## 12. API endpoints

### Component APIs

```text
GET    /api/components
POST   /api/components
GET    /api/components/:id
PATCH  /api/components/:id
DELETE /api/components/:id
```

### Template APIs

```text
GET    /api/templates
POST   /api/templates
GET    /api/templates/:id
PATCH  /api/templates/:id
DELETE /api/templates/:id

POST   /api/templates/:id/publish
POST   /api/templates/:id/unpublish
GET    /api/templates/:id/export
```

### Public registration APIs

```text
GET    /api/public/templates/:slug
POST   /api/public/registrations
```

### Registration management APIs

```text
GET    /api/registrations
GET    /api/registrations/:id
PATCH  /api/registrations/:id
```

### Users APIs

```text
GET    /api/users
POST   /api/users
PATCH  /api/users/:id
```

### Email APIs

```text
GET    /api/email/campaigns
POST   /api/email/campaigns
POST   /api/email/campaigns/:id/send
POST   /api/email/test
```

### Integration APIs

```text
GET    /api/integrations
POST   /api/integrations/google/connect
GET    /api/integrations/google/callback
POST   /api/integrations/google/test
```

Every API must validate its input using Zod. Admin APIs must check authentication and role permissions on the server.

---

## 13. Environment configuration

Create `.env.example`:

```dotenv
NODE_ENV=development

NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_URI=

AUTH_SECRET=
INITIAL_ADMIN_EMAILS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_SHEETS_DEFAULT_ID=

PUBLIC_API_BASE_URL=
ALLOWED_PUBLIC_ORIGINS=

UPLOAD_MAX_BYTES=5242880

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

Actual credentials must be entered by the owner locally. Do not commit `.env.local` to Git.

---

## 14. Security requirements

This application handles personal data and ID documents. Security is mandatory.

- Verify every admin user's identity.
- Enforce role-based authorization server-side.
- Use secure sessions and cookies.
- Add CSRF protection where applicable.
- Rate-limit login and public registration APIs.
- Add CAPTCHA or anti-bot protection for public forms.
- Validate files on the server.
- Store ID documents privately.
- Encrypt OAuth refresh tokens at rest.
- Never expose API secrets in exported HTML.
- Prevent spreadsheet formula injection.
- Prevent duplicate registrations.
- Validate all incoming data server-side.
- Sanitize email HTML.
- Restrict CORS to approved domains.
- Log important admin actions.
- Do not include sensitive document data in logs.
- Provide a data retention and deletion policy.

## 15. Implementation phases

Build in this order. Do not skip ahead and leave the core unfinished.

| Phase | Work |
|---|---|
| 1 | Project foundation, MongoDB, Mongoose, authentication, admin layout |
| 2 | User management and role permissions |
| 3 | Component library CRUD |
| 4 | Registration template builder and conditional logic |
| 5 | Wonderla BANDHAN 13.2 reference template |
| 6 | Preview and standalone HTML export |
| 7 | Public registration API and MongoDB storage |
| 8 | File upload and private Google Drive integration |
| 9 | Google Sheets integration and field mapping |
| 10 | Email composer and Gmail integration |
| 11 | Settings and integration test screens |
| 12 | Security hardening and automated tests |

Do not provide MongoDB Atlas setup or Vercel deployment instructions before the complete source code is ready. The first delivery should be source code that can be tested locally.

## 16. Acceptance criteria

The application is not complete until all of these work.

### Authentication
- Only verified, allowlisted users can sign in.
- The two initial admins can be bootstrapped securely.
- Admin can add and deactivate users.
- Editor and Viewer permissions are enforced.

### Components and templates
- Admin can create, edit and deactivate components.
- Admin can select any subset of components for an event.
- Admin can reorder fields.
- Required/optional configuration works.
- Conditional logic works.
- Draft and publish work.
- Published templates are versioned.

### Wonderla form
- Employee details work.
- Cab conditional address works.
- Spouse fields work conditionally.
- Employee and spouse ID uploads work.
- Kids Yes/No works.
- Maximum three kids is enforced.
- Age 0–17 validation works.
- Height eligibility works.
- Ticket calculations work.
- Server recalculates totals.
- Invalid file formats and files over 5 MB are rejected.

### Standalone HTML
- Downloaded HTML opens independently.
- Responsive design works.
- Conditional fields work.
- Validation works.
- Submission reaches the configured public API.
- No secret is exposed.
- Success/error messages work.

### Integrations
- Google Drive event folder creation/selection works.
- ID files upload privately.
- Google Sheets mapping works.
- Existing headers are not renamed or moved.
- Duplicate sheet rows are prevented.
- Gmail test email works.
- Campaign email appears in the sender's Sent mail.
- Integration errors are visible and retryable.

### Quality
- TypeScript build passes.
- Lint passes.
- Unit tests pass.
- Integration tests pass.
- E2E tests pass.
- No dead buttons or placeholder pages remain.
- README setup instructions are complete.

---

## 17. Instructions to the future AI development agent

Copy this section along with the document when asking an AI agent to build the application:

> You are the senior full-stack developer responsible for implementing this Registration Management Platform.
>
> Read the complete specification before writing code. Do not simplify or omit requirements. Use Next.js App Router, TypeScript, Tailwind CSS, MongoDB and Mongoose. Do not use PostgreSQL or Prisma.
>
> The Wonderla BANDHAN 13.2 form and its Google Apps Script are the master behavioral references. Inspect the original files if they are attached to the task. Reuse their real field names, validation behavior and ticket calculation rules.
>
> Build a complete working application, not a starter scaffold. Do not leave placeholder pages, fake integration buttons, mock APIs or TODO-only functionality.
>
> Implement authentication and role-based authorization before exposing admin APIs. Keep secrets server-side. Build the reusable component library and form builder before the HTML exporter. The exported HTML must work independently on external hosting and submit to a secure public API.
>
> Implement and test MongoDB persistence, Google Drive, Google Sheets and Gmail integrations. Where owner credentials or OAuth consent are required, provide a real connection flow and clearly state the owner action required. Never pretend an integration has connected when it has not.
>
> Work phase by phase. After each phase, run the relevant tests and fix errors before moving forward. At the end, run the production build and all tests.
>
> Deliver the entire source project, `.env.example`, README, SECURITY.md, tests and a ZIP archive. Do not provide deployment instructions unless explicitly requested. Do not ask the owner to set up MongoDB until the source implementation is complete.

---

## 18. Existing reference files

The original project discussion already included these files:

- `Pasted text.txt` — Wonderla BANDHAN 13.2 HTML form.
- `Pasted text (2).txt` — Google Apps Script backend.
- Invitation email screenshot — banner, message and signature reference.

Important existing Apps Script rules:

- Maximum file size: 5 MB.
- Maximum kids: 3.
- Accepted file formats: JPG, JPEG, PNG, PDF.
- Required fields: Name, Company Name, Designation, Email, Mobile Number.
- Indian mobile regex: `^[6-9]\d{9}$`.
- Pickup address required when Cab = Yes.
- Spouse ID required when spouse attends.
- Child age must be a whole number from 0 to 17.
- Child height must be ABOVE 75 CM or BELOW 75 CM.
- Ticket totals are calculated from adult and child ticket selections.
- Spreadsheet headers are matched by name.
- Duplicate request IDs are checked.
- Spreadsheet text beginning with `=`, `+`, `-`, `@` is protected.

The original Apps Script also shows the existing Drive upload and spreadsheet submission workflow. Pasted text (2)

---
