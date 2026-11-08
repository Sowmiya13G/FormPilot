---
name: form-engine-and-conditional-logic
description: >-
  Use this skill when implementing, extending, or testing dynamic form components,
  complex field validation rules, repeatable field groups, and the conditional visibility evaluation engine.
---

# Form Engine and Conditional Logic Skill

This skill defines the technical rules and implementation patterns for the dynamic form engine, conditional evaluation logic, and validation rules used across both the Next.js form builder preview and the standalone HTML exporter.

## 1. Supported Field Types
The component library and form engine must support these 15 field types:
1. `text`: Single-line text input
2. `email`: Email input with RFC 5322 validation
3. `tel`: Mobile phone input (specialized Indian mobile format `^[6-9]\d{9}$`)
4. `number`: Numeric input with min, max, and integer restrictions
5. `date`: Date picker
6. `select`: Dropdown selection
7. `radio`: Single choice radio group
8. `checkbox`: Single boolean toggle
9. `checkbox-group`: Multi-select checkboxes
10. `textarea`: Multi-line text area
11. `file`: File upload with file type and size restrictions
12. `hidden`: Hidden metadata field
13. `section`: Section heading divider
14. `info`: Informational rich text / instructions
15. `repeatable`: Dynamic repeatable group (e.g. attendee or child details)

---

## 2. Conditional Logic Engine Specification

### Rule Schema
Each field or section can define conditional visibility rules:
```typescript
export interface ConditionRule {
  fieldKey: string;
  operator: 'equals' | 'notEquals' | 'isEmpty' | 'isNotEmpty' | 'greaterThan' | 'lessThan' | 'contains';
  value?: any;
}

export interface ConditionalConfig {
  action: 'show' | 'hide';
  matchType: 'all' | 'any'; // AND vs OR
  rules: ConditionRule[];
}
```

### Evaluation Logic
```typescript
export function evaluateRule(rule: ConditionRule, formValues: Record<string, any>): boolean {
  const actualValue = formValues[rule.fieldKey];

  switch (rule.operator) {
    case 'equals':
      return String(actualValue ?? '') === String(rule.value ?? '');
    case 'notEquals':
      return String(actualValue ?? '') !== String(rule.value ?? '');
    case 'isEmpty':
      return actualValue === undefined || actualValue === null || String(actualValue).trim() === '';
    case 'isNotEmpty':
      return actualValue !== undefined && actualValue !== null && String(actualValue).trim() !== '';
    case 'greaterThan':
      return Number(actualValue) > Number(rule.value);
    case 'lessThan':
      return Number(actualValue) < Number(rule.value);
    case 'contains':
      return Array.isArray(actualValue) ? actualValue.includes(rule.value) : String(actualValue ?? '').includes(String(rule.value));
    default:
      return true;
  }
}

export function isFieldVisible(config: ConditionalConfig | undefined, formValues: Record<string, any>): boolean {
  if (!config || !config.rules || config.rules.length === 0) return true;

  const matches = config.rules.map(rule => evaluateRule(rule, formValues));
  const isMatch = config.matchType === 'any' ? matches.some(Boolean) : matches.every(Boolean);

  return config.action === 'show' ? isMatch : !isMatch;
}
```

### Critical Rule: Field Clearing on Hide
When a field evaluates to hidden:
1. Immediately clear its stored value in form state (`form.setValue(key, undefined)` or `input.value = ''`).
2. Remove any validation errors associated with that field.
3. Hidden field values must **never** be included in submission payloads or sent to MongoDB / Google Sheets.

---

## 3. Wonderla BANDHAN 13.2 Concrete Examples

### Example 1: Cab Pickup Address
- Condition: `Cab Required == 'Yes'`
- Action: Show `Pickup Address` and make required.
- On `Cab Required == 'No'`: Clear `Pickup Address` value and hide.

### Example 2: Spouse ID & Ticket
- Condition: `Spouse / Partner Name` is not empty.
- Action: Show `Spouse ID Card` (required), show `Spouse Height Eligibility`, show `Spouse Ticket Required`.
- If `Spouse / Partner Name` is blank: Hide spouse ID upload and spouse ticket options; clear their values.

### Example 3: Kids Dynamic Group & Maximum Limit
- Condition: `Are you bringing kids? == 'Yes'`.
- Action: Show repeatable kids container with minimum 1 child block.
- Allow adding child blocks up to a strict limit of **3 kids**.
- Each child block requires: `Child Name`, `Age` (0–17), `Height Eligibility` (`ABOVE 75 CM` / `BELOW 75 CM`), and `Ticket Required` (`Yes`/`No`).
- If `Are you bringing kids? == 'No'`: Clear all kid records and hide the container.

---

## 4. Ticket Summary Calculation

### Real-Time Client Calculation & Strict Server Recalculation
```typescript
export interface TicketSummary {
  employeeTickets: number; // 0 or 1
  spouseTickets: number;   // 0 or 1
  kidsTickets: number;     // 0 to 3
  kidsAbove75cm: number;
  kidsBelow75cm: number;
  totalTickets: number;
}

export function calculateTickets(data: any): TicketSummary {
  const employeeTickets = data.employeeTicketRequired === 'Yes' ? 1 : 0;
  
  const hasSpouse = Boolean(data.spouseName && data.spouseName.trim().length > 0);
  const spouseTickets = (hasSpouse && data.spouseTicketRequired === 'Yes') ? 1 : 0;

  let kidsTickets = 0;
  let kidsAbove75cm = 0;
  let kidsBelow75cm = 0;

  if (data.bringingKids === 'Yes' && Array.isArray(data.kids)) {
    for (const kid of data.kids) {
      if (kid.ticketRequired === 'Yes') {
        kidsTickets++;
      }
      if (kid.heightEligibility === 'ABOVE 75 CM') {
        kidsAbove75cm++;
      } else if (kid.heightEligibility === 'BELOW 75 CM') {
        kidsBelow75cm++;
      }
    }
  }

  return {
    employeeTickets,
    spouseTickets,
    kidsTickets,
    kidsAbove75cm,
    kidsBelow75cm,
    totalTickets: employeeTickets + spouseTickets + kidsTickets
  };
}
```

The server must run `calculateTickets` on the submitted payload and overwrite any client-submitted ticket summary.

