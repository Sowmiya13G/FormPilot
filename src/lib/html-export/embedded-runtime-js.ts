import { ITemplateField } from '@/types';

export function compileEmbeddedRuntimeJs(
  submitUrl: string,
  fields: ITemplateField[]
): string {
  // Extract fields with conditional configs
  const fieldsWithConditions = fields.filter(
    (f) => f.conditionalConfig && f.conditionalConfig.rules && f.conditionalConfig.rules.length > 0
  );

  return `
  (function() {
    'use strict';

    // 1. Generate Client UUIDv4 for Idempotency
    function generateUUID() {
      if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    var idempotencyInput = document.getElementById('idempotencyKey');
    if (idempotencyInput && !idempotencyInput.value) {
      idempotencyInput.value = generateUUID();
    }

    var form = document.getElementById('registrationForm');
    var submitBtn = document.getElementById('btnSubmit');
    var spinner = document.getElementById('submitSpinner');
    var btnText = document.getElementById('btnText');
    var errorBanner = document.getElementById('errorBanner');
    var successScreen = document.getElementById('successScreen');
    var formWrapper = document.getElementById('formWrapper');

    // 2. Conditional Visibility Rules
    var conditionalRules = ${JSON.stringify(fieldsWithConditions)};

    function evaluateRule(rule, values) {
      var val = values[rule.fieldKey];
      var strVal = (val !== undefined && val !== null) ? String(val).trim() : '';

      switch (rule.operator) {
        case 'equals':
          return strVal.toLowerCase() === String(rule.value || '').trim().toLowerCase();
        case 'notEquals':
          return strVal.toLowerCase() !== String(rule.value || '').trim().toLowerCase();
        case 'isEmpty':
          return strVal === '';
        case 'isNotEmpty':
          return strVal !== '';
        case 'greaterThan':
          return Number(strVal) > Number(rule.value);
        case 'lessThan':
          return Number(strVal) < Number(rule.value);
        case 'contains':
          return strVal.toLowerCase().indexOf(String(rule.value || '').toLowerCase()) !== -1;
        default:
          return true;
      }
    }

    function getFormValues() {
      var values = {};
      var elements = form.elements;

      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (!el.name) continue;

        if (el.type === 'radio') {
          if (el.checked) {
            values[el.name] = el.value;
          }
        } else if (el.type === 'checkbox') {
          if (!values[el.name]) values[el.name] = [];
          if (el.checked) values[el.name].push(el.value);
        } else {
          values[el.name] = el.value;
        }
      }
      return values;
    }

    function clearFieldInputs(groupEl) {
      var inputs = groupEl.querySelectorAll('input, select, textarea');
      inputs.forEach(function(input) {
        if (input.type === 'radio' || input.type === 'checkbox') {
          input.checked = false;
        } else if (input.type !== 'hidden') {
          input.value = '';
        }
        input.classList.remove('input-error');
      });
      var errEl = groupEl.querySelector('.field-error');
      if (errEl) errEl.classList.remove('visible');
    }

    function runConditionalEngine() {
      var values = getFormValues();

      conditionalRules.forEach(function(fieldConfig) {
        var groupEl = document.getElementById('group_' + fieldConfig.fieldKey);
        if (!groupEl) return;

        var config = fieldConfig.conditionalConfig;
        if (!config || !config.rules || config.rules.length === 0) return;

        var matches = config.rules.map(function(r) {
          return evaluateRule(r, values);
        });

        var isMatch = config.matchType === 'any'
          ? matches.some(Boolean)
          : matches.every(Boolean);

        var isVisible = config.action === 'show' ? isMatch : !isMatch;

        if (isVisible) {
          groupEl.classList.remove('is-hidden');
        } else {
          if (!groupEl.classList.contains('is-hidden')) {
            clearFieldInputs(groupEl);
            groupEl.classList.add('is-hidden');
          }
        }
      });

      updateTicketSummary();
    }

    // 3. Repeatable Kids Section Manager (Strict Max 3)
    var kidsContainer = document.getElementById('kidsContainer');
    var btnAddChild = document.getElementById('btnAddChild');
    var maxKids = 3;

    function getChildCount() {
      if (!kidsContainer) return 0;
      return kidsContainer.querySelectorAll('.child-card').length;
    }

    function updateChildUI() {
      if (!kidsContainer || !btnAddChild) return;
      var count = getChildCount();
      btnAddChild.disabled = count >= maxKids;
      btnAddChild.innerText = count >= maxKids ? 'Max 3 Children Added' : '+ Add Child';
      updateTicketSummary();
    }

    if (btnAddChild) {
      btnAddChild.addEventListener('click', function() {
        var count = getChildCount();
        if (count >= maxKids) return;

        var childIndex = count;
        var card = document.createElement('div');
        card.className = 'child-card';
        card.dataset.index = childIndex;

        card.innerHTML = 
          '<div class="child-card-header">' +
            '<span class="child-title">Child ' + (childIndex + 1) + '</span>' +
            '<button type="button" class="btn-remove-child">Remove</button>' +
          '</div>' +
          '<div class="grid">' +
            '<div class="col-6">' +
              '<label>Child Name <span class="req">*</span></label>' +
              '<input type="text" name="kids[' + childIndex + '][childName]" required placeholder="Enter child full name" />' +
            '</div>' +
            '<div class="col-6">' +
              '<label>Age (0–17) <span class="req">*</span></label>' +
              '<input type="number" min="0" max="17" name="kids[' + childIndex + '][age]" required placeholder="Age" />' +
            '</div>' +
            '<div class="col-6">' +
              '<label>Height Eligibility <span class="req">*</span></label>' +
              '<select name="kids[' + childIndex + '][heightEligibility]" required>' +
                '<option value="ABOVE 75 CM">ABOVE 75 CM</option>' +
                '<option value="BELOW 75 CM">BELOW 75 CM</option>' +
              '</select>' +
            '</div>' +
            '<div class="col-6">' +
              '<label>Ticket Required <span class="req">*</span></label>' +
              '<div class="radio-group">' +
                '<label class="choice-label">' +
                  '<input type="radio" name="kids[' + childIndex + '][ticketRequired]" value="Yes" checked /> Yes' +
                '</label>' +
                '<label class="choice-label">' +
                  '<input type="radio" name="kids[' + childIndex + '][ticketRequired]" value="No" /> No' +
                '</label>' +
              '</div>' +
            '</div>' +
          '</div>';

        card.querySelector('.btn-remove-child').addEventListener('click', function() {
          card.remove();
          reindexChildren();
          updateChildUI();
        });

        // Listen for ticket radio changes inside the card
        card.querySelectorAll('input').forEach(function(inp) {
          inp.addEventListener('input', updateTicketSummary);
          inp.addEventListener('change', updateTicketSummary);
        });

        kidsContainer.appendChild(card);
        updateChildUI();
      });
    }

    function reindexChildren() {
      if (!kidsContainer) return;
      var cards = kidsContainer.querySelectorAll('.child-card');
      cards.forEach(function(card, idx) {
        card.dataset.index = idx;
        card.querySelector('.child-title').innerText = 'Child ' + (idx + 1);
        card.querySelectorAll('input, select').forEach(function(input) {
          if (input.name) {
            input.name = input.name.replace(/kids\\[\\d+\\]/, 'kids[' + idx + ']');
          }
        });
      });
    }

    // 4. Live Ticket Calculator
    function updateTicketSummary() {
      var values = getFormValues();

      // Employee ticket
      var empTicket = values['employeeTicketRequired'] === 'Yes' ? 1 : 0;

      // Spouse ticket (only if spouseName entered and ticketRequired is Yes)
      var spouseName = values['spouseName'] ? String(values['spouseName']).trim() : '';
      var spouseTicket = (spouseName !== '' && values['spouseTicketRequired'] === 'Yes') ? 1 : 0;

      // Kids tickets
      var kidsTickets = 0;
      if (values['bringingKids'] === 'Yes' && kidsContainer) {
        var childCards = kidsContainer.querySelectorAll('.child-card');
        childCards.forEach(function(card) {
          var radioChecked = card.querySelector('input[type="radio"]:checked');
          if (radioChecked && radioChecked.value === 'Yes') {
            kidsTickets++;
          }
        });
      }

      var total = empTicket + spouseTicket + kidsTickets;

      var counterEl = document.getElementById('summaryTotalCounter');
      if (counterEl) {
        counterEl.innerText = total;
      }

      var detailEl = document.getElementById('summaryDetailText');
      if (detailEl) {
        detailEl.innerText = 'Employee (' + empTicket + ') + Spouse (' + spouseTicket + ') + Kids (' + kidsTickets + ')';
      }
    }

    // 5. File Selection Feedback & Size Checking
    form.querySelectorAll('input[type="file"]').forEach(function(fileInput) {
      fileInput.addEventListener('change', function() {
        var previewEl = document.getElementById('preview_' + fileInput.name);
        if (fileInput.files && fileInput.files[0]) {
          var f = fileInput.files[0];
          // Check 5 MB cap
          if (f.size > 5242880) {
            alert('File "' + f.name + '" exceeds the 5 MB maximum size limit. Please choose a smaller file.');
            fileInput.value = '';
            if (previewEl) previewEl.innerText = '';
            return;
          }
          if (previewEl) {
            previewEl.innerText = 'Selected: ' + f.name + ' (' + Math.round(f.size / 1024) + ' KB)';
          }
        } else {
          if (previewEl) previewEl.innerText = '';
        }
      });
    });

    // Attach real-time change listeners across the form
    form.addEventListener('input', runConditionalEngine);
    form.addEventListener('change', runConditionalEngine);

    // Initial pass on page load
    runConditionalEngine();

    // 6. Form Submission Handler
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      errorBanner.style.display = 'none';
      errorBanner.innerText = '';

      // Validate all visible required fields
      var hasErrors = false;
      var firstErrorEl = null;

      var groups = form.querySelectorAll('.field-group');
      groups.forEach(function(group) {
        if (group.classList.contains('is-hidden')) return;

        var isRequired = group.dataset.required === 'true';
        var inputs = group.querySelectorAll('input, select, textarea');
        var errEl = group.querySelector('.field-error');

        inputs.forEach(function(input) {
          input.classList.remove('input-error');
        });

        if (isRequired) {
          var filled = false;
          inputs.forEach(function(input) {
            if (input.type === 'radio' || input.type === 'checkbox') {
              var checkedAny = group.querySelector('input:checked');
              if (checkedAny) filled = true;
            } else if (input.type === 'file') {
              if (input.files && input.files.length > 0) filled = true;
            } else {
              if (input.value && input.value.trim() !== '') filled = true;
            }
          });

          if (!filled) {
            hasErrors = true;
            inputs.forEach(function(input) { input.classList.add('input-error'); });
            if (errEl) {
              errEl.innerText = 'This field is required';
              errEl.classList.add('visible');
            }
            if (!firstErrorEl) firstErrorEl = inputs[0];
          }
        }

        // Validate Indian Mobile Number if applicable
        var telInput = group.querySelector('input[type="tel"]');
        if (telInput && telInput.value && !group.classList.contains('is-hidden')) {
          var mobileRegex = /^[6-9]\\d{9}$/;
          if (!mobileRegex.test(telInput.value.trim())) {
            hasErrors = true;
            telInput.classList.add('input-error');
            if (errEl) {
              errEl.innerText = 'Please enter a valid 10-digit Indian mobile number';
              errEl.classList.add('visible');
            }
            if (!firstErrorEl) firstErrorEl = telInput;
          }
        }
      });

      if (hasErrors) {
        errorBanner.innerText = 'Please correct the highlighted fields before submitting.';
        errorBanner.style.display = 'block';
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorEl.focus();
        }
        return;
      }

      // Enter loading state
      submitBtn.disabled = true;
      spinner.style.display = 'inline-block';
      btnText.innerText = 'Submitting Registration...';

      var formData = new FormData(form);

      fetch('${submitUrl}', {
        method: 'POST',
        body: formData,
      })
      .then(function(res) {
        return res.json().then(function(data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function(result) {
        if (!result.ok || !result.data.success) {
          throw new Error(result.data.error || 'Submission failed. Please try again.');
        }

        // Success: hide form, show celebration screen
        form.style.display = 'none';
        var regIdEl = document.getElementById('confirmedRegId');
        if (regIdEl) {
          regIdEl.innerText = result.data.registrationId || '';
        }
        successScreen.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function(err) {
        console.error('Registration Error:', err);
        errorBanner.innerText = err.message || 'Network error occurred. Please check your connection and try again.';
        errorBanner.style.display = 'block';
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        btnText.innerText = 'Submit Registration';
      });
    });

  })();
  `;
}

export default compileEmbeddedRuntimeJs;

