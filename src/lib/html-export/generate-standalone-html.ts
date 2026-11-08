import { IRegistrationTemplate, IComponent } from '@/types';
import { compileEmbeddedCss } from './embedded-css';
import { compileEmbeddedRuntimeJs } from './embedded-runtime-js';
import { generateWonderlaHtml } from './generate-wonderla-html';

export function generateStandaloneHtml(
  template: IRegistrationTemplate,
  components: IComponent[],
  publicApiBaseUrl: string
): string {
  // If the template is the Wonderla Bandhan template, use the specialized pixel-perfect layout
  if (
    template.slug === 'wonderla-bandhan-13-2' ||
    template.eventName.toLowerCase().includes('bandhan')
  ) {
    return generateWonderlaHtml(template, publicApiBaseUrl);
  }

  const componentLookup: Record<string, IComponent> = {};
  components.forEach((c) => {
    componentLookup[c.key] = c;
  });

  const submitUrl = `${publicApiBaseUrl.replace(/\/+$/, '')}/api/public/registrations`;
  const css = compileEmbeddedCss(template.theme);
  const runtimeJs = compileEmbeddedRuntimeJs(submitUrl, template.fields);

  const hasTicketSummary = template.fields.some((f) =>
    f.fieldKey.toLowerCase().includes('ticket')
  );

  const renderedFieldsHtml = template.fields
    .map((field) => {
      const comp = componentLookup[field.componentKey] || {};
      const label = field.label || comp.label || field.fieldKey;
      const placeholder = field.placeholder || comp.placeholder || '';
      const helpText = field.helpText || comp.helpText || '';
      const isRequired = field.required !== undefined ? field.required : Boolean(comp.defaultRequired);
      const widthClass =
        field.width === 'half' ? 'col-6' : field.width === 'third' ? 'col-4' : 'col-12';

      // Special handling for Repeatable Kids section
      if (comp.type === 'repeatable' || field.fieldKey === 'kids') {
        return `
          <div id="group_${field.fieldKey}" class="field-group col-12" data-required="${isRequired}">
            <label>${label} ${isRequired ? '<span class="req">*</span>' : ''}</label>
            ${helpText ? `<span class="field-help">${helpText}</span>` : ''}
            <div class="repeatable-container">
              <div id="kidsContainer" style="display:flex; flex-direction:column; gap:12px;"></div>
              <button type="button" id="btnAddChild" class="btn-add-child">+ Add Child</button>
            </div>
            <span class="field-error"></span>
          </div>
        `;
      }

      // File upload dropzone
      if (comp.type === 'file') {
        return `
          <div id="group_${field.fieldKey}" class="field-group ${widthClass}" data-required="${isRequired}">
            <label for="${field.fieldKey}">${label} ${isRequired ? '<span class="req">*</span>' : ''}</label>
            <div class="file-dropzone" onclick="document.getElementById('${field.fieldKey}').click();">
              <svg style="width:28px; height:28px; margin:0 auto; color:#94a3b8; display:block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div style="font-size:13px; font-weight:600; color:#334155; margin-top:6px;">Choose document file or drag here</div>
              <div style="font-size:11px; color:#94a3b8; margin-top:2px;">JPG, JPEG, PNG, or PDF (Max 5 MB)</div>
              <div id="preview_${field.fieldKey}" class="file-name-preview"></div>
            </div>
            <input type="file" id="${field.fieldKey}" name="${field.fieldKey}" accept=".jpg,.jpeg,.png,.pdf" style="display:none;" />
            <span class="field-error"></span>
          </div>
        `;
      }

      // Dropdown Select
      if (comp.type === 'select') {
        const optionsHtml = (comp.options || [])
          .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
          .join('\n');

        return `
          <div id="group_${field.fieldKey}" class="field-group ${widthClass}" data-required="${isRequired}">
            <label for="${field.fieldKey}">${label} ${isRequired ? '<span class="req">*</span>' : ''}</label>
            <select id="${field.fieldKey}" name="${field.fieldKey}">
              <option value="">${placeholder || 'Select an option'}</option>
              ${optionsHtml}
            </select>
            ${helpText ? `<span class="field-help">${helpText}</span>` : ''}
            <span class="field-error"></span>
          </div>
        `;
      }

      // Radio Group
      if (comp.type === 'radio') {
        const radioOptionsHtml = (comp.options || [])
          .map(
            (opt) => `
            <label class="choice-label">
              <input type="radio" name="${field.fieldKey}" value="${opt.value}" />
              <span>${opt.label}</span>
            </label>
          `
          )
          .join('\n');

        return `
          <div id="group_${field.fieldKey}" class="field-group ${widthClass}" data-required="${isRequired}">
            <label>${label} ${isRequired ? '<span class="req">*</span>' : ''}</label>
            <div class="radio-group">
              ${radioOptionsHtml}
            </div>
            ${helpText ? `<span class="field-help">${helpText}</span>` : ''}
            <span class="field-error"></span>
          </div>
        `;
      }

      // Textarea
      if (comp.type === 'textarea') {
        return `
          <div id="group_${field.fieldKey}" class="field-group ${widthClass}" data-required="${isRequired}">
            <label for="${field.fieldKey}">${label} ${isRequired ? '<span class="req">*</span>' : ''}</label>
            <textarea id="${field.fieldKey}" name="${field.fieldKey}" rows="3" placeholder="${placeholder}"></textarea>
            ${helpText ? `<span class="field-help">${helpText}</span>` : ''}
            <span class="field-error"></span>
          </div>
        `;
      }

      // Section divider / Heading
      if (comp.type === 'section') {
        return `
          <div id="group_${field.fieldKey}" class="col-12" style="padding-top:16px; margin-bottom:4px; border-bottom:1px solid #e2e8f0;">
            <h3 style="font-size:16px; font-weight:700; color:#0f172a;">${label}</h3>
            ${helpText ? `<p style="font-size:12px; color:#64748b; margin-top:2px;">${helpText}</p>` : ''}
          </div>
        `;
      }

      // Standard text/email/tel/number/date input
      const inputType =
        comp.type === 'tel'
          ? 'tel'
          : comp.type === 'email'
          ? 'email'
          : comp.type === 'number'
          ? 'number'
          : comp.type === 'date'
          ? 'date'
          : 'text';

      return `
        <div id="group_${field.fieldKey}" class="field-group ${widthClass}" data-required="${isRequired}">
          <label for="${field.fieldKey}">${label} ${isRequired ? '<span class="req">*</span>' : ''}</label>
          <input type="${inputType}" id="${field.fieldKey}" name="${field.fieldKey}" placeholder="${placeholder}" />
          ${helpText ? `<span class="field-help">${helpText}</span>` : ''}
          <span class="field-error"></span>
        </div>
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${template.eventName} — Event Registration</title>
  <style>
    ${css}
  </style>
</head>
<body>
  <div class="form-wrapper" id="formWrapper">
    ${
      template.theme?.bannerImageUrl
        ? `<div class="banner-container"><img src="${template.theme.bannerImageUrl}" alt="${template.eventName}" /></div>`
        : ''
    }

    <div class="form-header">
      <h1 class="form-title">${template.eventName}</h1>
      ${template.description ? `<p class="form-desc">${template.description}</p>` : ''}
    </div>

    <div class="form-body">
      <!-- Error Notification Banner -->
      <div id="errorBanner" class="alert-banner alert-error"></div>

      <!-- Registration Form -->
      <form id="registrationForm" novalidate>
        <input type="hidden" name="templateId" value="${template._id}" />
        <input type="hidden" name="templateSlug" value="${template.slug}" />
        <input type="hidden" name="templateVersion" value="${template.version}" />
        <input type="hidden" id="idempotencyKey" name="idempotencyKey" value="" />

        <div class="grid">
          ${renderedFieldsHtml}
        </div>

        ${
          hasTicketSummary
            ? `
          <div class="ticket-summary-box">
            <div>
              <div class="summary-title">Total Wonderla Tickets</div>
              <div id="summaryDetailText" class="summary-subtitle">Employee (0) + Spouse (0) + Kids (0)</div>
            </div>
            <div id="summaryTotalCounter" class="summary-counter">0</div>
          </div>
          `
            : ''
        }

        <div style="margin-top: 24px;">
          <button type="submit" id="btnSubmit" class="btn-submit">
            <span id="submitSpinner" class="spinner"></span>
            <span id="btnText">Submit Registration</span>
          </button>
        </div>
      </form>

      <!-- Success Screen -->
      <div id="successScreen" class="success-screen">
        <div class="success-icon">&#10003;</div>
        <h2 class="success-title">Registration Confirmed!</h2>
        <p class="success-text">
          Thank you! Your event registration has been received and verified. Your confirmation ID is:
          <br /><strong id="confirmedRegId" style="color:#0284c7; font-size:16px;"></strong>
        </p>
      </div>
    </div>
  </div>

  <script>
    ${runtimeJs}
  </script>
</body>
</html>`;
}

export default generateStandaloneHtml;

