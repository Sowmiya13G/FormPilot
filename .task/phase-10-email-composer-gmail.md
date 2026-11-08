# Phase 10: Email Campaign Composer & Gmail API Integration

## 1. Objectives & Scope
Implement the Email Campaign feature to compose and send event invitation emails via the Gmail API:
- Send emails using the authorized sender's own Gmail account so emails appear in their actual **Sent** folder.
- Support clickable banner image linking directly to the registration URL.
- Support fallback alt text and button in case images are blocked by recipient email clients.
- Allow admin to compose rich HTML body and plain text fallback.
- Support multiple recipients via individual personalized sends or blind copy (BCC) to avoid exposing attendee email addresses to each other.
- Support test email sending to admin before sending the full campaign.
- Store campaign logs, provider message IDs, sent timestamps, and delivery errors in MongoDB.
- Support custom email signature configuration.

---

## 2. Target File Structure
```text
src/
├── app/
│   ├── (admin)/
│   │   └── send-email/
│   │       ├── page.tsx               # Email composer, preview & campaign history
│   │       └── EmailComposerClient.tsx# Client form for drafting & previewing email
│   └── api/
│       └── email/
│           ├── campaigns/
│           │   ├── route.ts           # GET campaigns history, POST draft campaign
│           │   └── [campaignId]/
│           │       └── send/
│           │           └── route.ts   # POST trigger campaign dispatch
│           └── test/
│               └── route.ts           # POST send single test email
├── components/
│   └── email/
│       ├── EmailPreviewCard.tsx       # Live visual preview of the email rendered as HTML
│       ├── BannerUploader.tsx         # Upload or select banner image URL
│       └── RecipientInput.tsx         # Tag-based input for comma/newline-separated emails
├── lib/
│   ├── email/
│   │   ├── gmail.ts                   # Gmail API client (MIME generation, base64url, send)
│   │   └── template-builder.ts        # HTML email template compiler (banner, body, button, signature)
│   └── validations/
│       └── email.ts                   # Zod schemas for campaign and test email payloads
└── models/
    └── EmailCampaign.ts               # Mongoose EmailCampaign model
```

---

## 3. Step-by-Step Tasks

### Step 10.1: EmailCampaign Mongoose Model (`models/EmailCampaign.ts`)
Define `EmailCampaign` schema:
- `subject`: String, required.
- `body`: String, required (HTML / Markdown).
- `bannerImageUrl`: String.
- `registrationUrl`: String, required.
- `fallbackText`: String.
- `recipients`: Array of strings (email addresses).
- `cc`: Array of strings.
- `bcc`: Array of strings.
- `sender`: String (admin's connected Gmail address).
- `status`: Enum (`'DRAFT'`, `'QUEUED'`, `'SENDING'`, `'SENT'`, `'PARTIALLY_SENT'`, `'FAILED'`), default `'DRAFT'`.
- `sentCount`: Number, default 0.
- `failedCount`: Number, default 0.
- `providerMessageIds`: Array of strings.
- `errorDetails`: Array of `{ recipient: string, error: string, timestamp: Date }`.
- `sentAt`: Date.
- `createdBy`: String.
- Timestamps (`createdAt`, `updatedAt`).

### Step 10.2: HTML Email Generator (`src/lib/email/template-builder.ts`)
- Build responsive, cross-client email HTML template (tested with Gmail, Outlook, Apple Mail):
  ```html
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Clickable Banner -->
    <a href="{{registrationUrl}}" target="_blank" style="text-decoration: none; display: block;">
      <img src="{{bannerImageUrl}}" alt="{{fallbackText}}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; display: block;" />
    </a>
    
    <!-- Body Content -->
    <div style="margin-top: 24px; color: #1f2937; line-height: 1.6; font-size: 16px;">
      {{bodyHtml}}
    </div>

    <!-- Fallback Call to Action Button -->
    <div style="margin: 30px 0; text-align: center;">
      <a href="{{registrationUrl}}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
        Register Now
      </a>
    </div>

    <!-- Email Signature -->
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
      {{signatureHtml}}
    </div>
  </div>
  ```

### Step 10.3: Gmail Service Adapter (`src/lib/email/gmail.ts`)
- Uses `getAuthenticatedGoogleClient('gmail')`.
- Constructs RFC 2822 MIME message string.
- Base64url encodes the message:
  ```typescript
  const raw = Buffer.from(mimeString).toString('base64url');
  ```
- Calls `gmail.users.messages.send({ userId: 'me', requestBody: { raw } })`.
- Implements batch sending logic:
  - Iterates through recipient list sending individual emails to ensure no recipient sees other recipients' email addresses in the `To:` header.
  - Rate limits execution (e.g. 500ms delay between sends to respect Gmail daily quotas).

### Step 10.4: Email APIs
- `POST /api/email/test`:
  - Validates `{ testEmail, subject, body, bannerImageUrl, registrationUrl }`.
  - Dispatches immediate single test email to `testEmail`.
- `POST /api/email/campaigns`:
  - Validates and saves campaign as `DRAFT`.
- `POST /api/email/campaigns/[campaignId]/send`:
  - Enforce `requireEditor()` or `requireAdmin()`.
  - Transitions status to `SENDING`.
  - Loops over recipients, tracks progress, and updates `sentCount` and `failedCount`.
  - Transitions to `SENT` or `PARTIALLY_SENT`.

### Step 10.5: Send Email Admin Interface (`app/(admin)/send-email/page.tsx`)
- Two-column or tabbed UI:
  - Left panel:
    - Subject input.
    - Template selector (auto-populates registration URL and banner).
    - Banner Image URL input + preview.
    - Fallback Alt Text input.
    - Rich Text / HTML Body editor.
    - Recipients text area (supports pasting comma, space, or newline separated emails with instant chip parsing).
    - Test Email input + "Send Test" button.
    - "Send Campaign" button with confirmation modal showing recipient count.
  - Right panel:
    - Live interactive email preview card showing banner, body, button, and signature exactly as it will appear in an inbox.
- Campaign History section below:
  - Table of previous campaigns with date, subject, recipient count, status badge, and view details button.

---

## 4. Acceptance Criteria
- [ ] Admin can compose an email with a clickable banner image linking to the registration URL.
- [ ] Clicking "Send Test" sends an email to the test address via the connected Gmail account.
- [ ] Sent emails appear in the authenticated admin's Gmail "Sent" folder.
- [ ] Fallback alt text and action button render properly even if image loading is disabled.
- [ ] Multi-recipient sends do NOT expose the entire attendee email list to recipients.
- [ ] Campaign history table displays previous campaigns with status, recipient count, and errors.

