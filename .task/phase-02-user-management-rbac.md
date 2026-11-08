# Phase 2: User Management & Role-Based Access Control (RBAC)

## 1. Objectives & Scope
Implement the full user management lifecycle, allowlist administration, and role-based access control (RBAC):
- Allow authorized administrators to view, invite/pre-allowlist, edit roles, and activate/deactivate users.
- Enforce strict server-side RBAC across all mutating admin APIs and UI views.
- Implement audit logging for sensitive user state modifications.

---

## 2. Roles & Permission Matrix
| Role | Permissions |
|:---|:---|
| **ADMIN** | Full administrative rights: manage users, settings, API credentials, templates, components, email campaigns, registrations, and downloads. |
| **EDITOR** | Can create, edit, duplicate, and publish components, templates, and email campaigns. Can view registrations. Cannot manage users or global integration credentials. |
| **VIEWER** | Read-only access: view dashboard, templates, components, campaigns, and registrations. Cannot create, edit, publish, or delete anything. |

---

## 3. Target File Structure
```text
src/
├── app/
│   ├── (admin)/
│   │   └── users/
│   │       ├── page.tsx               # User management table & invite modal
│   │       └── UserListClient.tsx     # Client component for user table & actions
│   └── api/
│       └── users/
│           ├── route.ts               # GET users list, POST pre-allowlist user
│           └── [userId]/
│               └── route.ts           # PATCH user (role, active status), DELETE user
├── components/
│   └── users/
│       ├── InviteUserModal.tsx        # Add authorized email modal
│       ├── EditUserRoleModal.tsx      # Change role modal (Admin/Editor/Viewer)
│       └── UserStatusToggle.tsx       # Activate/Deactivate switch
├── lib/
│   ├── auth/
│   │   └── permissions.ts             # Server helpers: `requireAdmin()`, `requireEditor()`, `requireAuth()`
│   └── validations/
│       └── user.ts                    # Zod schemas for user invite and role update
├── models/
│   └── AuditLog.ts                    # Mongoose AuditLog schema
└── scripts/
    └── seed-admins.ts                 # CLI script to bootstrap initial admin accounts into DB
```

---

## 4. Step-by-Step Tasks

### Step 2.1: Server-Side RBAC Helpers (`lib/auth/permissions.ts`)
- Implement utility functions that inspect the active server session:
  - `getCurrentUser()`: Returns sanitized user record from session.
  - `requireAuth()`: Throws/returns 401 if unauthenticated.
  - `requireRole(allowedRoles: Role[])`: Validates session role against allowed roles, throws/returns 403 if insufficient permissions.
  - `requireAdmin()`: Shorthand for `requireRole(['ADMIN'])`.
  - `requireEditor()`: Shorthand for `requireRole(['ADMIN', 'EDITOR'])`.

### Step 2.2: Audit Log Model (`models/AuditLog.ts`)
- Implement AuditLog schema:
  - `actor`: String (admin email or ID)
  - `action`: String (e.g. `'USER_INVITED'`, `'ROLE_UPDATED'`, `'USER_DEACTIVATED'`)
  - `resourceType`: String (e.g. `'User'`, `'Template'`, `'Integration'`)
  - `resourceId`: String
  - `beforeSummary`: Object / Record
  - `afterSummary`: Object / Record
  - `timestamp`: Date

### Step 2.3: User Management API Endpoints
- `GET /api/users`:
  - Enforce `requireAdmin()`.
  - Fetch all registered and allowlisted users sorted by creation date.
- `POST /api/users`:
  - Enforce `requireAdmin()`.
  - Validate payload with Zod: `{ email: z.string().email(), role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']) }`.
  - Normalize email to lowercase. Prevent duplicates.
  - Insert user record with `active: true`, `createdBy: currentAdmin.email`.
  - Write audit log.
- `PATCH /api/users/[userId]`:
  - Enforce `requireAdmin()`.
  - Validate payload: `{ role?: Role, active?: boolean }`.
  - Prevent admin from deactivating or demoting their own currently logged-in account (self-lockout prevention).
  - Update user in MongoDB. Write audit log.
- `DELETE /api/users/[userId]`:
  - Enforce `requireAdmin()`.
  - Soft-delete or remove user. Prevent self-deletion.

### Step 2.4: Admin Users Management UI (`app/(admin)/users/page.tsx`)
- Display user table containing:
  - User details (Avatar, Name, Email)
  - Role badge (Admin = Purple, Editor = Blue, Viewer = Gray)
  - Status indicator (Active = Green, Inactive = Red)
  - Last Login date / time
  - Actions dropdown: Change Role, Deactivate/Activate, Remove
- "Add Authorized Email" button opening `InviteUserModal`:
  - Input: Email address
  - Select: Initial Role
  - Validation: Email syntax check

### Step 2.5: Admin Bootstrap CLI Script (`scripts/seed-admins.ts`)
- Standalone TypeScript script executable via `npx tsx scripts/seed-admins.ts`.
- Reads `INITIAL_ADMIN_EMAILS` from `.env.local` or arguments and creates initial admin user entries directly in MongoDB if not already present.

---

## 5. Acceptance Criteria
- [ ] Only users with `'ADMIN'` role can access `/users` and `/api/users/*`.
- [ ] Editors and Viewers attempting to access user endpoints receive 403 Forbidden.
- [ ] Admin cannot deactivate or demote their own active account.
- [ ] Pre-allowlisted email users can successfully log in with Google OAuth on their first attempt and inherit their assigned role.
- [ ] Deactivated users are blocked from logging in and rejected on subsequent API requests.
- [ ] All user invitations, role changes, and deactivations produce corresponding `AuditLog` records.

