# Phase 4: Registration Template Builder & Conditional Field Engine

## 1. Objectives & Scope
Build the main Form Builder interface allowing administrators to create, customize, order, and configure dynamic event registration forms:
- Select fields from the Component Library.
- Reorder fields using drag-and-drop or reordering controls.
- Override field labels, placeholders, and required/optional status per event.
- Configure complex conditional visibility rules (show/hide fields based on user answers).
- Configure event metadata (slug, description, banner URL, background image URL, theme colors, allowed origins, Google Sheet/Drive bindings).
- Save as draft and publish with automated versioning.

---

## 2. Conditional Visibility Engine Specification
Support conditions on any field:
- **Operators**: `equals`, `notEquals`, `isEmpty`, `isNotEmpty`, `greaterThan`, `lessThan`, `contains`.
- **Match Type**: `all` (AND) or `any` (OR).
- **Action**: `show` or `hide`.
- **Behavior**: When a field is hidden, its state is cleared to prevent leaking irrelevant or stale data into submission payloads.

---

## 3. Target File Structure
```text
src/
├── app/
│   ├── (admin)/
│   │   └── registration-templates/
│   │       ├── page.tsx               # Template list (drafts, published, version badges)
│   │       ├── new/
│   │       │   └── page.tsx           # New template builder
│   │       └── [templateId]/
│   │           └── page.tsx           # Edit existing template builder
│   └── api/
│       └── templates/
│           ├── route.ts               # GET all templates, POST new template
│           └── [templateId]/
│               ├── route.ts           # GET, PATCH, DELETE template
│               ├── publish/
│               │   └── route.ts       # POST publish (increments version, sets status)
│               └── unpublish/
│                   └── route.ts       # POST unpublish (reverts to draft)
├── components/
│   ├── form-builder/
│   │   ├── FormBuilder.tsx            # Main builder canvas containing field list & palette
│   │   ├── ComponentPalette.tsx       # Available components drawer to add fields
│   │   ├── FieldConfigModal.tsx       # Modal to edit per-template field overrides & rules
│   │   ├── ConditionalRulesBuilder.tsx# Visual condition builder (IF field OP val THEN show)
│   │   ├── ThemeConfigurator.tsx      # Colors, background image, logo/banner URLs
│   │   └── IntegrationSettingsTab.tsx # Google Drive folder & Sheet ID mapping
│   └── dynamic-form/
│       ├── DynamicFormRenderer.tsx    # Live form renderer with conditional logic
│       └── evaluateCondition.ts       # Pure conditional logic evaluator
├── lib/
│   └── validations/
│       └── template.ts                # Zod schemas for template creation & updates
└── models/
    └── RegistrationTemplate.ts        # Mongoose RegistrationTemplate model
```

---

## 4. Step-by-Step Tasks

### Step 4.1: RegistrationTemplate Mongoose Model (`models/RegistrationTemplate.ts`)
Define `RegistrationTemplate` schema:
- `eventName`: String, required.
- `slug`: String, required, unique, lowercase, trimmed (e.g. `'wonderla-bandhan-13-2'`).
- `description`: String.
- `status`: Enum (`'DRAFT'`, `'PUBLISHED'`, `'ARCHIVED'`), default `'DRAFT'`.
- `version`: Number, default 1.
- `theme`:
  - `primaryColor`: String (hex code)
  - `backgroundColor`: String
  - `backgroundImageUrl`: String
  - `bannerImageUrl`: String
  - `logoUrl`: String
  - `fontFamily`: String
- `fields`: Array of template field configs:
  - `componentKey`: String, required (references Component.key)
  - `fieldKey`: String, required (unique per template)
  - `label`: String (overridable)
  - `placeholder`: String (overridable)
  - `helpText`: String (overridable)
  - `required`: Boolean
  - `order`: Number
  - `width`: Enum (`'full'`, `'half'`, `'third'`)
  - `conditionalConfig`:
    - `action`: `'show'` | `'hide'`
    - `matchType`: `'all'` | `'any'`
    - `rules`: Array of `{ fieldKey: string, operator: string, value: any }`
  - `validationOverride`: Object (optional overrides for min/max, file size, etc.)
- `allowedOrigins`: Array of strings (client website domains allowed to submit).
- `driveFolderId`: String (Google Drive target folder ID).
- `spreadsheetId`: String (Google Sheets target spreadsheet ID).
- `sheetTabId`: String (Sheet tab name or ID).
- `sheetMapping`: Map / Record of `{ fieldKey: string -> sheetHeader: string }`.
- `createdBy`: String, `updatedBy`: String, `publishedAt`: Date.
- Timestamps (`createdAt`, `updatedAt`).

### Step 4.2: Template CRUD & Publish APIs
- `GET /api/templates`: List templates with filter by status, search by name/slug.
- `POST /api/templates`: Create draft template. Validates unique slug with Zod.
- `GET /api/templates/[templateId]`: Retrieve full template configuration.
- `PATCH /api/templates/[templateId]`: Update template fields, theme, or settings. If editing a published template, bump minor revision or allow editing draft.
- `POST /api/templates/[templateId]/publish`:
  - Validates that template has at least 1 field.
  - Updates `status = 'PUBLISHED'`, increments `version`, sets `publishedAt = new Date()`.
- `POST /api/templates/[templateId]/unpublish`:
  - Sets `status = 'DRAFT'`.

### Step 4.3: Visual Form Builder Canvas (`components/form-builder/FormBuilder.tsx`)
- Three-panel or tabbed UI:
  1. **Field Canvas**:
     - Displays ordered cards for every field added to the form.
     - Move Up / Move Down buttons or Drag-and-drop handles.
     - Quick indicators on each card: Required badge, Conditional badge, Field Type icon.
     - Action buttons on card: "Configure Rules", "Delete from Form".
  2. **Component Palette**:
     - Collapsible sidebar showing reusable components grouped by category.
     - Search input.
     - "Add to Form" button on each component.
  3. **Event & Theme Settings Tab**:
     - Form title, slug, description.
     - Theme colors and background image URL.
     - Header banner image URL.
     - Allowed client domains (CORS origins).

### Step 4.4: Conditional Rules Builder Modal (`components/form-builder/ConditionalRulesBuilder.tsx`)
- Provides a clean visual UI:
  - Select Action: `Show this field` OR `Hide this field`.
  - Select Match: `When ALL conditions match` OR `When ANY condition matches`.
  - Condition rows:
    - Target Field: Dropdown of all other fields in the template.
    - Operator: `Equals`, `Does not equal`, `Is empty`, `Is not empty`, `Greater than`, `Less than`, `Contains`.
    - Value: Text / Option picker matching target field's type.
    - "+ Add Condition" button.

### Step 4.5: Interactive Form Preview
- Render an interactive preview side-by-side or in a tab:
  - Form dynamically reacts to field changes using `evaluateCondition()`.
  - If field A changes, dependent field B shows/hides instantaneously.
  - Confirms validation triggers on blur/submit.

---

## 5. Acceptance Criteria
- [ ] Admin/Editor can create a new template with custom slug, title, and theme.
- [ ] Components can be selected from the palette, added to the canvas, and reordered.
- [ ] Field-level overrides (label, required toggle) persist correctly.
- [ ] Conditional rules can be configured visually and evaluated correctly in the live preview.
- [ ] When a condition hides a field, its value is wiped clean from state.
- [ ] Publishing increments template version and makes it accessible for public use and export.

