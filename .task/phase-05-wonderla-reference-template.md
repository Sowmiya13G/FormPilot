# Phase 5: Wonderla BANDHAN 13.2 Master Reference Template & Seed

## 1. Objectives & Scope
Implement the full Wonderla BANDHAN 13.2 event form as the benchmark reference template:
- Seed all individual Wonderla form components into the Component Library.
- Seed the complete Wonderla BANDHAN 13.2 `RegistrationTemplate` document into MongoDB.
- Implement the exact business rules, validations, conditional triggers, dynamic repeatable kids section (up to 3 children), and ticket summary calculations matching the master specification.

---

## 2. Wonderla BANDHAN 13.2 Field & Rule Specification

### 2.1 Personal Details
| Field Name | Key | Type | Rules & Validation |
|:---|:---|:---|:---|
| Customer / Employee Name | `employeeName` | Text | Required |
| Company Name | `companyName` | Text | Required |
| Designation | `designation` | Text | Required |
| Email | `email` | Email | Required, valid email |
| Mobile Number | `mobileNumber` | Tel | Required, regex `^[6-9]\d{9}$` (Indian 10-digit mobile) |
| Cab Required | `cabRequired` | Radio (Yes / No) | Required |
| Pickup Address | `pickupAddress` | Textarea | Required ONLY IF `cabRequired === 'Yes'` |

### 2.2 Spouse Details (Conditional)
| Field Name | Key | Type | Rules & Validation |
|:---|:---|:---|:---|
| Spouse / Partner Name | `spouseName` | Text | Optional |
| Spouse Height Eligibility | `spouseHeightEligibility` | Select | Visible ONLY IF `spouseName` is not empty. Default: `ABOVE 75 CM` |
| Spouse Ticket Required | `spouseTicketRequired` | Radio (Yes / No) | Visible ONLY IF `spouseName` is not empty. Required if spouse attending |
| Spouse ID Card | `spouseIdCard` | File | Visible and REQUIRED ONLY IF `spouseName` is not empty. Max 5MB, JPG/PNG/PDF |

### 2.3 Employee ID Upload
| Field Name | Key | Type | Rules & Validation |
|:---|:---|:---|:---|
| Employee ID Card | `employeeIdCard` | File | Required. Max 5MB, JPG/PNG/PDF |
| Employee Height Eligibility | `employeeHeightEligibility` | Select | Default: `ABOVE 75 CM` |
| Employee Ticket Required | `employeeTicketRequired` | Radio (Yes / No) | Required. Default: `Yes` |

### 2.4 Kids / Children Details (Dynamic Repeatable Group)
| Field Name | Key | Type | Rules & Validation |
|:---|:---|:---|:---|
| Are you bringing kids? | `bringingKids` | Radio (Yes / No) | Required |
| Kids Container | `kids` | Repeatable Group | Visible ONLY IF `bringingKids === 'Yes'`. **Max 3 kids**. |

**Each Child Row contains:**
- `childName`: Text, Required
- `age`: Number, Required, whole integer 0 to 17
- `heightEligibility`: Select (`ABOVE 75 CM`, `BELOW 75 CM`), Required
- `ticketRequired`: Radio (`Yes`, `No`), Required

### 2.5 Live & Server-Side Ticket Summary Calculation
```text
Total Wonderla Tickets = 
    (employeeTicketRequired === 'Yes' ? 1 : 0)
  + (spouseName is not empty && spouseTicketRequired === 'Yes' ? 1 : 0)
  + (Count of kids where ticketRequired === 'Yes')
```
Counters:
- Kids Above 75 CM
- Kids Below 75 CM
- Total Tickets

---

## 3. Target File Structure
```text
src/
├── features/
│   └── templates/
│       ├── wonderla-template.definition.ts # Complete JSON schema definition for Wonderla BANDHAN 13.2
│       └── ticketCalculator.ts            # Ticket summary calculation utility (client & server shared)
└── scripts/
    └── seed-wonderla-template.ts          # CLI script to seed components and template into MongoDB
```

---

## 4. Step-by-Step Tasks

### Step 5.1: Ticket Calculation Logic (`src/features/templates/ticketCalculator.ts`)
- Implement pure TypeScript function `calculateTicketSummary(formData)`:
  - Validates inputs.
  - Calculates adult employee ticket.
  - Checks if `spouseName` is present and spouse ticket is required.
  - If `bringingKids === 'Yes'` and `Array.isArray(kids)`, iterates over kids:
    - Increments `kidsAbove75cm` or `kidsBelow75cm`.
    - Increments `kidsTickets` if `ticketRequired === 'Yes'`.
  - Computes `totalTickets`.
  - Returns `{ employeeTickets, spouseTickets, kidsTickets, kidsAbove75cm, kidsBelow75cm, totalTickets }`.
- Export unit test suite to test edge cases (0 kids, 1 kid with no ticket, max 3 kids, spouse absent).

### Step 5.2: Repeatable Child Group Form Component
- Implement `RepeatableKidsSection.tsx`:
  - Enforces `maxLimit = 3`.
  - "Add Child" button (disabled when child count reaches 3).
  - "Remove" button on each child card (updates array and recalculates totals).
  - Inline validation for child age between 0 and 17.
  - Dynamic change triggers update to live summary box.

### Step 5.3: Wonderla Template Definition File
- In `wonderla-template.definition.ts`, export the complete specification with:
  - `eventName`: `'Wonderla BANDHAN 13.2'`
  - `slug`: `'wonderla-bandhan-13-2'`
  - Pre-configured conditional rules:
    - Pickup address depends on `cabRequired == 'Yes'`
    - Spouse ID, height, and ticket depend on `spouseName != ''`
    - Kids section depends on `bringingKids == 'Yes'`
  - Default spreadsheet column mappings matching original Apps Script headers.

### Step 5.4: Seed Script (`scripts/seed-wonderla-template.ts`)
- Script connects to MongoDB via `src/lib/db/mongoose.ts`.
- Inserts or updates each individual component in `Component` collection.
- Inserts or updates the Wonderla template in `RegistrationTemplate` collection with `status = 'PUBLISHED'`.
- Adds an npm script in `package.json`: `"seed:wonderla": "tsx scripts/seed-wonderla-template.ts"`.

---

## 5. Acceptance Criteria
- [ ] Running `npm run seed:wonderla` populates the database with all Wonderla components and the published template.
- [ ] In the admin UI, Wonderla template opens in the template builder with all fields, order, and rules intact.
- [ ] In preview mode, toggling `Cab Required` instantly toggles `Pickup Address`.
- [ ] Entering text in `Spouse / Partner Name` instantly displays `Spouse ID Card` and ticket questions.
- [ ] Toggling `Are you bringing kids?` to `Yes` reveals the repeatable kids section.
- [ ] The user can add up to 3 children; the "Add Child" button disables at 3.
- [ ] Child ages outside 0–17 trigger validation errors.
- [ ] Ticket summary displays live accurate totals matching the specification formula.

