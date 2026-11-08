---
name: standalone-html-generator
description: >-
  Use this skill when building, updating, or testing the standalone HTML form generation engine
  that compiles dynamic event templates into self-contained HTML/CSS/JS files for client hosting.
---

# Standalone HTML Form Generator Skill

This skill guides the implementation, maintenance, and verification of the standalone HTML generator. The generator transforms a `RegistrationTemplate` configuration stored in MongoDB into a single, self-contained HTML file that can be downloaded by an admin and hosted on any external client web server.

## Architectural Mandates

1. **Zero External Runtime Dependency**:
   - The generated HTML must NOT require React, Next.js, or any remote JavaScript framework CDN (like jQuery or external script tags that can fail or get blocked by client firewalls).
   - Use clean, modern vanilla JavaScript (ES6+) and embedded CSS.

2. **Zero Credentials in Output**:
   - Never embed MongoDB connection strings, Google API keys, OAuth secrets, or admin credentials.
   - The only external endpoint known to the generated file is the public registration API submission URL (e.g., `https://your-domain.com/api/public/registrations`).

3. **Complete Feature Parity with Live Preview**:
   - Field validations (Required, Email format, Indian mobile regex `^[6-9]\d{9}$`, min/max length, number ranges).
   - Dynamic conditional visibility engine (show/hide fields based on dependent field values; clear hidden field values).
   - Repeatable group blocks (e.g. up to 3 kids, add/remove row buttons).
   - Dynamic ticket summary calculator.
   - Client-side file validation (size <= 5 MB, allowed types: jpg, jpeg, png, pdf).
   - Accessible error messages, field highlighting, loading spinners, and submit disabled states.
   - Double-submit prevention via client UUID idempotency key.

## Generated HTML Structure

The standalone HTML generator (in `src/lib/html-export/generate-standalone-html.ts`) must assemble the document following this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{eventName}} — Registration</title>
  <style>
    /* 1. Reset and base typography */
    /* 2. Responsive layout container (mobile to desktop) */
    /* 3. Theme styling (primary colors, background image styling, borders, shadows) */
    /* 4. Form inputs, labels, validation error banners, button states */
    /* 5. Repeatable kid rows & ticket summary card styling */
    /* 6. Success and error feedback modal/alerts */
  </style>
</head>
<body>
  <div class="form-container">
    <!-- Header banner image if configured -->
    <!-- Form title, description, badge -->
    <form id="registrationForm" novalidate>
      <input type="hidden" name="templateId" value="{{templateId}}" />
      <input type="hidden" name="templateVersion" value="{{templateVersion}}" />
      <input type="hidden" id="idempotencyKey" name="idempotencyKey" value="" />

      <!-- Rendered field elements grouped by sections -->
      <!-- Repeatable kid details block with 'Add Child' / 'Remove' -->
      <!-- Live ticket summary box -->
      <!-- Submit button with loading spinner -->
      <!-- Response notification message container -->
    </form>
  </div>

  <script>
    (function() {
      // 1. Generate client UUIDv4 for idempotency
      // 2. Field conditional logic engine (rules evaluator)
      // 3. Repeatable kid manager (enforce max limit, dynamic fields)
      // 4. Ticket calculator (Employee + Spouse + Kids ticket count)
      // 5. Client file validation (5MB max, MIME check)
      // 6. Form submit handler (FormData packaging, AJAX fetch to API, error display, success UI)
    })();
  </script>
</body>
</html>
```

## Step-by-Step Generation Procedure

1. **Load Template & Components**:
   - Retrieve template document by ID.
   - Expand all component keys and load their validation rules, labels, placeholders, options, and conditional configurations.

2. **Assemble CSS Theme**:
   - Extract primary color, background image, logo, and font choices from `template.theme`.
   - Produce responsive CSS with mobile-first media queries (`@media (min-width: 640px)`).

3. **Render DOM Elements**:
   - Render each field with its appropriate HTML5 input (`type="text"`, `type="email"`, `type="tel"`, `type="file"`, etc.).
   - Attach data attributes for conditional rules: `data-field-key="pickupAddress"` `data-depends-on="cabRequired"` `data-condition-operator="equals"` `data-condition-value="Yes"`.

4. **Inject Client-Side JavaScript Runtime**:
   - Evaluate conditional rules on every `change` and `input` event.
   - When a field is hidden:
     - Clear input value (`input.value = ''` or uncheck radio/checkbox).
     - Remove any active validation error on that field.
   - Recalculate ticket summary on change.
   - Intercept submit:
     - Run full form validation check.
     - Build `FormData` (supports file uploads and JSON payload).
     - Send `fetch(submitUrl, { method: 'POST', body: formData })`.
     - Show spinner; disable submit button.
     - On 200/201: Show success screen and hide form.
     - On error: Display readable error message and re-enable submit button.

## Verification Checklist
- [ ] File size is self-contained under 100 KB.
- [ ] No external script tags or network dependencies to render.
- [ ] Form submit sends `multipart/form-data` with all inputs and file attachments.
- [ ] Hidden conditional fields do not leak stale data into submission payload.
- [ ] Mobile responsive layout verified on 375px width and desktop 1200px width.

