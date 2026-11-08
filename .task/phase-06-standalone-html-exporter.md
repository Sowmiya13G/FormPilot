# Phase 6: Live Preview & Standalone HTML Generator / Exporter

## 1. Objectives & Scope
Implement the Standalone HTML Generator—one of the core capabilities of the platform:
- Compile any `RegistrationTemplate` stored in MongoDB into a single, self-contained `.html` file.
- The exported file must run independently in any browser on any client web server or static host.
- Zero server-side React or Next.js runtime dependencies.
- Zero secrets or private keys exposed in the HTML.
- Embed pure CSS styling, responsive layout, dynamic conditional logic engine, repeatable kids block (max 3), live ticket summary calculator, client validation, and secure AJAX/fetch submission to `/api/public/registrations`.
- Provide a full interactive preview modal and one-click "Download HTML" button in the admin interface.

---

## 2. Technical Requirements
1. **Single File Output**:
   - All CSS embedded inside `<style>...</style>`.
   - All JavaScript runtime embedded inside `<script>...</script>`.
   - HTML markup strictly self-contained.
2. **Submission Configuration**:
   - Form submits to `PUBLIC_API_BASE_URL + '/api/public/registrations'`.
   - Passes `templateId`, `templateVersion`, generated `idempotencyKey`, and all form fields + file attachments as `multipart/form-data`.
3. **UX & State Management**:
   - Submit button enters loading state with animated spinner and is disabled to prevent rapid multi-clicks.
   - On HTTP 200/201: Hides form and displays animated Branded Success Banner with confirmation details.
   - On error: Displays accessible error alert and re-enables submit button.

---

## 3. Target File Structure
```text
src/
├── app/
│   ├── (public)/
│   │   └── register/
│   │       └── [slug]/
│   │           └── page.tsx           # Direct hosted Next.js public view for testing/preview
│   └── api/
│       └── templates/
│           └── [templateId]/
│               └── export/
│                   └── route.ts       # GET route returning downloadable standalone HTML file
├── components/
│   └── form-builder/
│       ├── StandalonePreviewModal.tsx # Full-screen iframe preview of generated HTML
│       └── ExportHtmlButton.tsx       # Download button trigger
└── lib/
    └── html-export/
        ├── generate-standalone-html.ts# Core HTML/CSS/JS compiler function
        ├── embedded-css.ts            # Responsive form theme styles compiler
        └── embedded-runtime-js.ts     # Pure vanilla JS runtime string (validation + conditions)
```

---

## 4. Step-by-Step Tasks

### Step 6.1: Vanilla JS Runtime Compiler (`src/lib/html-export/embedded-runtime-js.ts`)
- Author the self-contained client-side script template to be injected into the HTML:
  - **UUID Generator**: Generates v4 UUID and populates hidden `idempotencyKey` input.
  - **Conditional Logic Evaluator**:
    - Scans fields with `data-rules` attributes.
    - Listens to `input` and `change` events across the form.
    - Evaluates operators (`equals`, `notEquals`, `isEmpty`, `isNotEmpty`, `greaterThan`, `lessThan`).
    - Hides/shows DOM elements smoothly using CSS class `.hidden { display: none !important; }`.
    - **Crucial**: Clears inputs of hidden fields.
  - **Dynamic Repeatable Kids Manager**:
    - Handles "Add Child" and "Remove" buttons.
    - Enforces maximum 3 children.
    - Re-indexes child field names: `kids[0][name]`, `kids[0][age]`, etc.
  - **Live Ticket Calculator**:
    - Listens to ticket radio/select inputs and updates DOM summary counters live.
  - **Client-Side Form Validator**:
    - Checks required fields.
    - Validates email syntax.
    - Validates Indian mobile `^[6-9]\d{9}$`.
    - Validates file size (rejects files > 5 MB) and MIME types (`.jpg`, `.jpeg`, `.png`, `.pdf`).
  - **Submission Fetch Handler**:
    - Builds `FormData` from the form element.
    - Posts to configured public endpoint.
    - Handles progress, error banners, and success screen toggle.

### Step 6.2: Responsive Embedded CSS Compiler (`src/lib/html-export/embedded-css.ts`)
- Generates clean, modern CSS reset and styling:
  - Responsive container (max width 680px, centered, mobile padding).
  - Background image styling with overlay readability layer.
  - Typography, inputs with focus rings, hover effects, and error borders.
  - Ticket summary widget styling.
  - Loading spinner and success celebration card.

### Step 6.3: Core Generator Function (`src/lib/html-export/generate-standalone-html.ts`)
- Accepts a populated `RegistrationTemplate` document and `publicApiBaseUrl: string`.
- Assembles the HTML document:
  - Injects sanitized title, banner image, and form fields.
  - Injects compiled CSS.
  - Injects compiled JavaScript runtime with template-specific conditional rules baked in as JSON.
- Returns complete HTML string.

### Step 6.4: Export API Endpoint (`src/app/api/templates/[templateId]/export/route.ts`)
- Authenticated admin route (`requireEditor()`).
- Fetches template and components.
- Invokes `generateStandaloneHtml(template, publicApiBaseUrl)`.
- Returns response with headers:
  - `Content-Type: text/html; charset=utf-8`
  - `Content-Disposition: attachment; filename="{slug}-registration.html"`

### Step 6.5: Admin Preview & Export UI
- In the template builder header:
  - "Preview Form" button: Opens `StandalonePreviewModal` rendering the generated HTML inside a sandboxed `<iframe>` to simulate external hosting.
  - "Download HTML" button: Direct link to download the `.html` file.

---

## 5. Acceptance Criteria
- [ ] Exported HTML opens locally in Chrome, Firefox, Safari, and Edge via `file://` or static web server.
- [ ] Responsive layout adapts flawlessly from 360px mobile to desktop.
- [ ] All conditional fields (Cab pickup, Spouse ID, Kids block) show/hide properly.
- [ ] Max 3 kids limitation is strictly enforced in the standalone file.
- [ ] Ticket summary calculates dynamically in real-time.
- [ ] Standalone file contains no external CDN script links, no React, and no private server secrets.
- [ ] File size is lightweight (< 100 KB).
- [ ] Submissions successfully transmit payload to the platform's public API.

