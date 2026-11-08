# FormPilot Security Policy & Architecture

## Overview
**FormPilot — The Registration Hub** is designed with enterprise-grade data protection, confidentiality, and integrity controls for employee and attendee registration data.

---

## 1. Authentication & Role-Based Access Control (RBAC)
- **Role Hierarchy**:
  - `ADMIN`: Full administrative control, user role management, system settings, and credential configuration.
  - `EDITOR`: Form template authoring, standalone HTML exports, email campaigns, and registration viewing.
  - `VIEWER`: Read-only access to registrations and analytics.
- **Self-Lockout Prevention**: System prevents the last active administrator from downgrading their own privileges or deactivating themselves.
- **Audit Logging**: Every administrative mutation (`TEMPLATE_PUBLISHED`, `USER_ROLE_CHANGED`, `SETTINGS_UPDATED`) records actor identity, action type, target ID, and timestamp in MongoDB.

---

## 2. Document & PII Protection
- **Private Google Drive Access**:
  - Uploaded identity verification documents (Employee ID card, Spouse ID card) are stored in designated private Google Drive folders.
  - Files are never made public via `anyoneWithLink`.
  - Authorized administrators view and stream documents exclusively via the authenticated proxy route:
    `GET /api/registrations/:id/files/:fileId`
- **File Validation**:
  - Maximum upload size capped at 5 MB per document.
  - Strict MIME type whitelisting (`image/jpeg`, `image/png`, `application/pdf`).

---

## 3. Spreadsheet Injection Mitigation
- Values beginning with formula triggers (`=`, `+`, `-`, `@`) can execute arbitrary code in spreadsheet software when opened by staff.
- FormPilot passes all values through `sanitizeForSheet()` which safely prepends an apostrophe (`'`) to neutralise formula execution.
- Indian mobile numbers are explicitly formatted with a leading quote to prevent spreadsheet software from dropping leading zeros or converting numbers to scientific notation.

---

## 4. Idempotency & Abuse Protection
- **Idempotency Keys**:
  - Every client form submission generates a unique UUIDv4 idempotency key.
  - Submitting twice with the same key returns the existing registration with HTTP 200 without creating duplicate documents or multiple ticket allocations.
- **Server-Side Ticket Recalculation**:
  - Client-submitted totals are ignored; ticket counts are recalculated on the server using verified business logic rules.
- **Rate Limiting**:
  - Public registration endpoints enforce in-memory IP rate limiting (maximum 30 requests per minute per IP).
- **CORS Domain Whitelisting**:
  - Templates enforce `allowedOrigins` checking HTTP `Origin` headers to prevent unauthorized embedding.

---

## 5. Token Encryption at Rest
- Sensitive Google OAuth refresh tokens and access tokens are encrypted before persistence in MongoDB using AES-256-GCM authenticated encryption.
- Plaintext secrets are never exposed in administrative API payloads or UI responses.

