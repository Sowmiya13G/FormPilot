# Phase 3: Reusable Component Library CRUD

## 1. Objectives & Scope
Build the Reusable Component Library where administrators can create, edit, duplicate, search, and manage individual form field definitions.
- Support all 15 required field types.
- Store field metadata, validation configuration, dropdown/radio options, and default states in MongoDB.
- Provide a responsive management UI with live field preview and search/filter capabilities.

---

## 2. 15 Supported Field Types
1. `text`: Single-line text input (name, designation, company, etc.)
2. `email`: Email input with RFC 5322 validation
3. `tel`: Mobile phone input (specialized Indian mobile format `^[6-9]\d{9}$`)
4. `number`: Numeric input with min, max, and integer restrictions
5. `date`: Date picker (DOB, event date)
6. `select`: Dropdown selection
7. `radio`: Single choice radio group
8. `checkbox`: Single boolean toggle
9. `checkbox-group`: Multi-select checkboxes
10. `textarea`: Multi-line text area (addresses, notes)
11. `file`: File upload with file type and size restrictions (ID cards)
12. `hidden`: Hidden metadata field
13. `section`: Section heading divider
14. `info`: Informational rich text / instructions
15. `repeatable`: Dynamic repeatable group (attendees, children)

---

## 3. Target File Structure
```text
src/
├── app/
│   ├── (admin)/
│   │   └── components/
│   │       ├── page.tsx               # Component catalog list, search & filters
│   │       ├── new/
│   │       │   └── page.tsx           # Create component editor
│   │       └── [componentId]/
│   │           └── page.tsx           # Edit component editor
│   └── api/
│       └── components/
│           ├── route.ts               # GET all components, POST new component
│           └── [componentId]/
│               └── route.ts           # GET, PATCH, DELETE component
├── components/
│   ├── form-builder/
│   │   ├── ComponentCard.tsx          # Card displaying component overview in catalog
│   │   ├── ComponentEditor.tsx        # Form for editing labels, keys, validation, options
│   │   ├── FieldPreview.tsx           # Live interactive preview of single component
│   │   └── ValidationConfigForm.tsx   # Sub-editor for regex, min/max, file types, etc.
│   └── dynamic-form/
│       └── FieldRenderer.tsx          # Generic renderer for individual field types
├── lib/
│   └── validations/
│       └── component.ts               # Zod validation schema for Component model
└── models/
    └── Component.ts                   # Mongoose Component model
```

---

## 4. Step-by-Step Tasks

### Step 3.1: Component Mongoose Model (`models/Component.ts`)
Define `Component` schema:
- `key`: String, required, unique, lowercase, trimmed (e.g. `'employeeName'`, `'cabRequired'`).
- `label`: String, required (e.g. `'Customer / Employee Name'`).
- `description`: String, optional.
- `type`: Enum of the 15 field types.
- `category`: Enum (`'Personal Details'`, `'Travel & Stay'`, `'ID & Verification'`, `'Family & Kids'`, `'Custom'`).
- `placeholder`: String.
- `helpText`: String.
- `defaultValue`: Mixed / Any.
- `defaultRequired`: Boolean, default false.
- `options`: Array of `{ label: string, value: string }` (for select, radio, checkbox-group).
- `validationConfig`: Object:
  - `minLength`: Number
  - `maxLength`: Number
  - `pattern`: String (Regex string, e.g. `^[6-9]\d{9}$`)
  - `patternMessage`: String
  - `minValue`: Number
  - `maxValue`: Number
  - `maxFileSize`: Number (default: 5242880 = 5MB)
  - `allowedFileTypes`: Array of strings (e.g. `['.jpg', '.jpeg', '.png', '.pdf']`)
- `active`: Boolean, default true.
- `version`: Number, default 1.
- Timestamps (`createdAt`, `updatedAt`).

### Step 3.2: Component API Endpoints
- `GET /api/components`:
  - Query parameters: `?search=`, `?type=`, `?category=`, `?active=`.
  - Returns array of components sorted by category and label.
- `POST /api/components`:
  - Enforce `requireEditor()`.
  - Validate with Zod schema in `lib/validations/component.ts`.
  - Ensure `key` is unique (slug format, alphanumeric + hyphens/underscores).
  - Create and return new component.
- `GET /api/components/[componentId]`:
  - Return component by ID or key.
- `PATCH /api/components/[componentId]`:
  - Enforce `requireEditor()`.
  - Validate updates with Zod schema. Update and increment `version`.
- `DELETE /api/components/[componentId]`:
  - Enforce `requireAdmin()`.
  - Soft-delete by setting `active: false` (or check if in use by templates before hard deletion).

### Step 3.3: Component Management UI (`app/(admin)/components/page.tsx`)
- Search bar (instant filter by label, key, or category).
- Category filter pills (`All`, `Personal Details`, `Travel & Stay`, `ID & Verification`, `Family & Kids`).
- Grid of `ComponentCard` items showing:
  - Component label, key badge, type badge.
  - Active/Inactive indicator.
  - Quick action buttons: Preview, Edit, Duplicate, Deactivate.
- "Create Component" button leading to `/components/new`.

### Step 3.4: Component Editor Screen (`app/(admin)/components/new/page.tsx` & `[componentId]/page.tsx`)
- Two-column layout:
  - Left column: Configuration form (`ComponentEditor`):
    - Basic Info: Label, Key (auto-generated from label if empty), Field Type, Category, Placeholder, Help Text.
    - Default required toggle.
    - Dynamic options builder (if `select`, `radio`, or `checkbox-group`).
    - Validation rules builder (`ValidationConfigForm`):
      - Regex pattern input + custom error message.
      - Min / Max length or Min / Max value.
      - For `file` inputs: Max size in MB (default 5 MB), file extension checkboxes (`.jpg`, `.jpeg`, `.png`, `.pdf`).
  - Right column: `FieldPreview`:
    - Renders the exact input component interactively so the admin can test typing, error display, and dropdown selections in real-time.

---

## 5. Acceptance Criteria
- [ ] Admins and Editors can create, view, edit, duplicate, and deactivate components.
- [ ] Viewers can only view and preview components; edit controls are disabled or hidden.
- [ ] Duplicate component keys are rejected with clear validation errors.
- [ ] All 15 field types can be created, saved, and rendered in `FieldPreview`.
- [ ] Option builder works seamlessly for `select`, `radio`, and `checkbox-group` types.
- [ ] File upload configuration properly saves max size and allowed extensions.

