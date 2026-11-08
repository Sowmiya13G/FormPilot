import { IRegistrationTemplate } from '@/types';

export function generateWonderlaHtml(
  template: IRegistrationTemplate,
  publicApiBaseUrl: string
): string {
  const submitUrl = `${publicApiBaseUrl.replace(/\/+$/, '')}/api/public/registrations`;
  const appsScriptUrl =
    'https://script.google.com/macros/s/AKfycbz_83N5hLSGyHc-uE2dbF2I2u0rz3cCSpHm1VQJUbGXh-KhO7IGh60JTdgU1JJq8oBU-g/exec';

  const logoUrl =
    template.theme?.logoUrl || 'https://vibrationevents.in/register/images/hitachi.png';
  const bgUrl =
    template.theme?.backgroundImageUrl ||
    'https://vibrationevents.in/register/images/bandhanNovBG.png';

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${template.eventName} - Registration</title>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
    }

    body {
      min-height: 100vh;
      background:
        linear-gradient(rgba(31, 13, 67, 0.72), rgba(31, 13, 67, 0.82)),
        url("${bgUrl}") center / cover fixed no-repeat;
      padding: 25px 15px;
    }

    .container {
      max-width: 850px;
      margin: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 25px;
      padding: 10px 5px;
    }

    @media (max-width: 767px) {
      .header {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 12px;
        text-align: center;
      }

      .header-left,
      .header-right {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .bandhan-title {
      color: #fff;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .header-right img {
      height: clamp(30px, 5vw, 50px);
      width: auto;
      display: block;
      filter: brightness(0) invert(1);
    }

    .form-card {
      background: rgba(255, 255, 255, 0.97);
      padding: 35px;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    }

    .form-heading {
      text-align: center;
      color: #32145e;
      font-size: 27px;
      margin-bottom: 8px;
    }

    .form-description {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    label {
      color: #333;
      font-size: 14px;
      font-weight: 600;
    }

    .required {
      color: #e00000;
      font-weight: bold;
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 13px 14px;
      border: 1px solid #d4d4d4;
      border-radius: 6px;
      background: #fff;
      color: #333;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input:focus,
    select:focus,
    textarea:focus {
      border-color: #60339b;
      box-shadow: 0 0 0 3px rgba(96, 51, 155, 0.12);
    }

    .input-error {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.08);
    }

    .error-message {
      display: block;
      color: #dc2626;
      font-size: 12px;
      min-height: 0;
      margin-top: -3px;
    }

    select {
      appearance: none;
      -webkit-appearance: none;
      cursor: pointer;
      padding-right: 40px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23555555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
    }

    textarea {
      min-height: 90px;
      resize: vertical;
    }

    input[type="file"] {
      padding: 10px;
      background: #fafafa;
    }

    .section-heading {
      grid-column: 1 / -1;
      color: #4b267d;
      font-size: 17px;
      font-weight: 700;
      padding-bottom: 8px;
      margin-top: 10px;
      border-bottom: 1px solid #e5ddef;
    }

    .conditional-field {
      display: none;
    }

    .hint {
      font-size: 12px;
      color: #777;
    }

    .submit-btn {
      width: 100%;
      margin-top: 28px;
      padding: 15px;
      border: none;
      border-radius: 6px;
      color: #fff;
      background: #54258b;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }

    .submit-btn:hover {
      background: #3e176d;
    }

    .submit-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    /* Toast notifications */
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      width: min(390px, calc(100vw - 30px));
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 11px;
      padding: 15px 17px;
      margin-bottom: 10px;
      border-radius: 9px;
      color: #fff;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
      font-size: 14px;
      line-height: 1.5;
      opacity: 0;
      transform: translateX(25px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: auto;
      overflow-wrap: anywhere;
    }

    .toast.show {
      opacity: 1;
      transform: translateX(0);
    }

    .toast.success {
      background: #16803c;
    }

    .toast.error {
      background: #c62828;
    }

    .toast.info {
      background: #424b57;
    }

    .toast-icon {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.2;
    }

    @media (max-width: 600px) {
      .toast-container {
        top: 12px;
        right: 15px;
        left: 15px;
        width: auto;
      }
    }

    footer {
      text-align: center;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      margin-top: 25px;
    }

    @media (max-width: 600px) {
      body {
        padding: 15px 10px;
        background-attachment: scroll;
      }

      .header {
        margin-bottom: 15px;
      }

      .bandhan-title {
        font-size: 25px;
      }

      .header-right img {
        max-width: 115px;
      }

      .form-card {
        padding: 22px 16px;
      }

      .form-heading {
        font-size: 23px;
      }

      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .full-width,
      .section-heading {
        grid-column: 1;
      }
    }

    /* ---------- Wonderla / Kids / Summary additions ---------- */
    .sub-card {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px 20px;
      padding: 18px;
      border: 1px solid #e5ddef;
      border-radius: 10px;
      background: #faf7fe;
    }

    .sub-card-title {
      grid-column: 1 / -1;
      color: #4b267d;
      font-size: 15px;
      font-weight: 700;
    }

    .readonly-value {
      background: #f1ecf8;
      color: #32145e;
      font-weight: 600;
      cursor: default;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .badge.above {
      background: #e7f6ec;
      color: #16803c;
    }

    .badge.below {
      background: #fff4e5;
      color: #a15c00;
    }

    #kidsContainer {
      grid-column: 1 / -1;
      display: none;
      flex-direction: column;
      gap: 16px;
    }

    .summary-card {
      grid-column: 1 / -1;
      border: 2px solid #60339b;
      border-radius: 10px;
      overflow: hidden;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 11px 16px;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid #eee6f6;
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-row strong {
      color: #32145e;
      text-align: right;
    }

    .summary-row.total {
      background: #54258b;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
    }

    .summary-row.total strong {
      color: #fff;
      font-size: 18px;
    }

    @media (max-width: 600px) {
      .sub-card {
        grid-template-columns: 1fr;
        padding: 14px;
      }

      .sub-card,
      #kidsContainer,
      .summary-card {
        grid-column: 1;
      }
    }
  </style>
</head>

<body>
  <main class="container">

    <header class="header">
      <div class="header-left">
        <span class="bandhan-title">${template.eventName}</span>
      </div>

      <div class="header-right">
        <img src="${logoUrl}" alt="Event Logo" />
      </div>
    </header>

    <section class="form-card">
      <h1 class="form-heading">Event Registration</h1>

      <p class="form-description">
        ${template.description || 'Please fill in the details below to complete your registration.'}
      </p>

      <form id="registrationForm">
        <input type="hidden" name="templateId" value="${template._id}" />
        <input type="hidden" name="templateSlug" value="${template.slug}" />
        <input type="hidden" name="templateVersion" value="${template.version}" />
        <input type="hidden" id="idempotencyKey" name="idempotencyKey" value="" />

        <div class="form-grid">

          <h3 class="section-heading">Personal Details</h3>

          <div class="form-group">
            <label for="name">Name <span class="required">*</span></label>
            <input type="text" id="name" name="name" placeholder="Enter your name" required />
          </div>

          <div class="form-group">
            <label for="companyName">Company Name <span class="required">*</span></label>
            <input type="text" id="companyName" name="companyName" placeholder="Enter company name" required />
          </div>

          <div class="form-group">
            <label for="designation">Designation <span class="required">*</span></label>
            <input type="text" id="designation" name="designation" placeholder="Enter designation" required />
          </div>

          <div class="form-group">
            <label for="email">Email <span class="required">*</span></label>
            <input type="email" id="email" name="email" placeholder="Enter email address" required />
            <small class="error-message" id="emailError"></small>
          </div>

          <div class="form-group">
            <label for="mobileNumber">Mobile Number <span class="required">*</span></label>
            <input type="tel" id="mobileNumber" name="mobileNumber" placeholder="Enter 10-digit mobile number" inputmode="numeric"
              maxlength="10" required />
            <small class="error-message" id="mobileError"></small>
          </div>

          <div class="form-group">
            <label for="cabReq">Cab Required? <span class="required">*</span></label>
            <select id="cabReq" name="cabReq" required>
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div class="form-group full-width conditional-field" id="addressGroup">
            <label for="address">Pickup Address <span class="required">*</span></label>
            <textarea id="address" name="address" placeholder="Enter your pickup address"></textarea>
          </div>

          <div class="form-group">
            <label for="spouseName">Spouse / Partner Name</label>
            <input type="text" id="spouseName" name="spouseName" placeholder="Enter spouse / partner name" />
          </div>

          <h3 class="section-heading">ID Card Details</h3>

          <div class="form-group full-width">
            <label for="employeeIdCard">Employee / Registrant ID Card <span class="required">*</span></label>
            <input type="file" id="employeeIdCard" name="employeeIdCard" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              required />
            <span class="hint">Upload the ID card of the person registering. JPG, JPEG, PNG or PDF. Maximum size: 5 MB.</span>
            <small class="error-message" id="employeeIdCardError"></small>
          </div>

          <div class="form-group full-width" id="spouseIdCardGroup">
            <label for="spouseIdCard">Spouse / Partner ID Card (Wife / Husband) <span class="required" id="spouseIdCardRequired" style="display:none;">*</span></label>
            <input type="file" id="spouseIdCard" name="spouseIdCard" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" />
            <span class="hint">Upload the ID card of your spouse / partner. Mandatory if your spouse / partner is attending. JPG, JPEG, PNG or PDF. Maximum size: 5 MB.</span>
            <small class="error-message" id="spouseIdCardError"></small>
          </div>

          <h3 class="section-heading">Wonderla Ticket Details</h3>

          <div class="sub-card" id="employeeTicketCard">
            <div class="sub-card-title">Employee Details</div>

            <div class="form-group">
              <label for="employeeNameDisplay">Employee Name</label>
              <input type="text" id="employeeNameDisplay" class="readonly-value" readonly tabindex="-1"
                placeholder="Taken from the Name field above" />
            </div>

            <div class="form-group">
              <label>Height Eligibility</label>
              <span class="badge above">ABOVE 75 CM</span>
            </div>

            <div class="form-group">
              <label for="employeeTicket">Wonderla Ticket Required? <span class="required">*</span></label>
              <select id="employeeTicket" name="employeeTicket" required>
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div class="sub-card conditional-field" id="spouseTicketCard">
            <div class="sub-card-title">Spouse / Partner Details</div>

            <div class="form-group">
              <label for="spouseNameDisplay">Spouse Name</label>
              <input type="text" id="spouseNameDisplay" class="readonly-value" readonly tabindex="-1" />
            </div>

            <div class="form-group">
              <label>Height Eligibility</label>
              <span class="badge above">ABOVE 75 CM</span>
            </div>

            <div class="form-group">
              <label for="spouseTicket">Wonderla Ticket Required? <span class="required">*</span></label>
              <select id="spouseTicket" name="spouseTicket">
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <h3 class="section-heading">Kids Details</h3>

          <div class="form-group">
            <label for="kids">Are you bringing kids to Wonderla? <span class="required">*</span></label>
            <select id="kids" name="kids" required>
              <option value="">Select an option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div class="form-group conditional-field" id="kidsCountGroup">
            <label for="kidsCount">How many kids are accompanying you? <span class="required">*</span></label>
            <select id="kidsCount" name="kidsCount">
              <option value="">Select count</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <small class="error-message" id="kidsCountError"></small>
          </div>

          <div id="kidsContainer" aria-live="polite"></div>

          <h3 class="section-heading">Wonderla Ticket Summary</h3>

          <div class="summary-card" id="ticketSummary">
            <div class="summary-row"><span>Employee Ticket Required</span><strong id="sumEmployee">—</strong></div>
            <div class="summary-row"><span>Spouse Ticket Required</span><strong id="sumSpouse">—</strong></div>
            <div class="summary-row"><span>Total Number of Kids</span><strong id="sumKids">0</strong></div>
            <div class="summary-row"><span>Kids Above 75 CM</span><strong id="sumKidsAbove">0</strong></div>
            <div class="summary-row"><span>Kids Below 75 CM</span><strong id="sumKidsBelow">0</strong></div>
            <div class="summary-row total"><span>Total Wonderla Tickets Required</span><strong id="sumTotal">0</strong></div>
          </div>

        </div>

        <button type="submit" class="submit-btn" id="submitBtn">
          Submit Registration
        </button>

      </form>
      <iframe name="registrationFrame" id="registrationFrame" title="Registration response"
        style="display:none;"></iframe>
    </section>

    <div id="toastContainer" class="toast-container" aria-live="polite" aria-atomic="true"></div>

    <footer>Thank You for Your Interest!</footer>
  </main>

  <script>
    const SUBMIT_URL = "${submitUrl}";
    const SCRIPT_URL = "${appsScriptUrl}";

    const MAX_FILE_BYTES = 5 * 1024 * 1024;
    const MAX_KIDS = 3;
    const ABOVE_LABEL = "ABOVE 75 CM";
    const BELOW_LABEL = "BELOW 75 CM";
    const ALLOWED_FILE_TYPES = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      pdf: "application/pdf"
    };

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

    const idempotencyInput = document.getElementById("idempotencyKey");
    if (idempotencyInput && !idempotencyInput.value) {
      idempotencyInput.value = generateUUID();
    }

    const form = document.getElementById("registrationForm");
    const submitBtn = document.getElementById("submitBtn");
    const toastContainer = document.getElementById("toastContainer");

    const nameInput = document.getElementById("name");

    const email = document.getElementById("email");
    const emailError = document.getElementById("emailError");

    const mobileNumber = document.getElementById("mobileNumber");
    const mobileError = document.getElementById("mobileError");

    const cabReq = document.getElementById("cabReq");
    const address = document.getElementById("address");

    const employeeIdCard = document.getElementById("employeeIdCard");
    const employeeIdCardError = document.getElementById("employeeIdCardError");
    const spouseIdCard = document.getElementById("spouseIdCard");
    const spouseIdCardError = document.getElementById("spouseIdCardError");

    const employeeNameDisplay = document.getElementById("employeeNameDisplay");
    const employeeTicket = document.getElementById("employeeTicket");
    const spouseName = document.getElementById("spouseName");
    const spouseNameDisplay = document.getElementById("spouseNameDisplay");
    const spouseTicket = document.getElementById("spouseTicket");

    const kids = document.getElementById("kids");
    const kidsCount = document.getElementById("kidsCount");
    const kidsCountError = document.getElementById("kidsCountError");
    const kidsContainer = document.getElementById("kidsContainer");

    function showField(id, show) {
      document.getElementById(id).style.display = show ? (id === "spouseTicketCard" ? "grid" : "flex") : "none";
    }

    function setRequired(element, required) {
      element.required = required;
    }

    function validateEmail() {
      const value = email.value.trim();
      const valid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);

      emailError.textContent = value && !valid
        ? "Please enter a valid email address."
        : "";

      email.classList.toggle("input-error", value !== "" && !valid);
      return valid;
    }

    function validateMobile() {
      const value = mobileNumber.value.trim();
      const valid = /^[6-9]\\d{9}$/.test(value);

      mobileError.textContent = value && !valid
        ? "Please enter a valid 10-digit mobile number."
        : "";

      mobileNumber.classList.toggle("input-error", value !== "" && !valid);
      return valid;
    }

    email.addEventListener("input", validateEmail);
    email.addEventListener("blur", validateEmail);

    mobileNumber.addEventListener("input", function () {
      this.value = this.value.replace(/\\D/g, "").slice(0, 10);
      validateMobile();
    });

    mobileNumber.addEventListener("blur", validateMobile);

    cabReq.addEventListener("change", function () {
      const show = this.value === "Yes";
      showField("addressGroup", show);
      setRequired(address, show);
      if (!show) address.value = "";
    });

    // Mirror employee name
    function syncEmployeeName() {
      employeeNameDisplay.value = nameInput.value.trim();
    }
    nameInput.addEventListener("input", syncEmployeeName);

    // Spouse Attendance & Mirroring
    function isSpouseAttending() {
      return spouseName.value.trim() !== "";
    }

    function updateSpouseFields() {
      const attending = isSpouseAttending();
      spouseNameDisplay.value = spouseName.value.trim();

      document.getElementById("spouseIdCardRequired").style.display = attending ? "inline" : "none";
      showField("spouseTicketCard", attending);

      setRequired(spouseIdCard, attending);
      setRequired(spouseTicket, attending);

      if (!attending) {
        spouseTicket.value = "";
        setFileError(spouseIdCard, spouseIdCardError, "");
      }

      updateSummary();
    }

    spouseName.addEventListener("input", updateSpouseFields);
    employeeTicket.addEventListener("change", updateSummary);
    spouseTicket.addEventListener("change", updateSummary);

    // File validation
    function getFileExtension(fileName) {
      const parts = String(fileName || "").toLowerCase().split(".");
      return parts.length > 1 ? parts.pop() : "";
    }

    function setFileError(input, errorEl, message) {
      errorEl.textContent = message;
      input.classList.toggle("input-error", message !== "");
    }

    function getFileValidationError(input, required, label) {
      const file = input.files[0];
      if (!file) {
        return required ? "Please upload the " + label + "." : "";
      }

      const extension = getFileExtension(file.name);
      const expectedMime = ALLOWED_FILE_TYPES[extension];
      const mimeOk = !file.type || Object.values(ALLOWED_FILE_TYPES).includes(file.type);

      if (!expectedMime || !mimeOk) {
        return label + " must be a JPG, JPEG, PNG or PDF file.";
      }

      if (file.size === 0) {
        return label + " file is empty. Please choose another file.";
      }

      if (file.size > MAX_FILE_BYTES) {
        return label + " must be 5 MB or smaller.";
      }

      return "";
    }

    function validateEmployeeIdCard() {
      const error = getFileValidationError(employeeIdCard, true, "Employee ID card");
      setFileError(employeeIdCard, employeeIdCardError, error);
      return error;
    }

    function validateSpouseIdCard() {
      const required = isSpouseAttending();
      const error = required
        ? getFileValidationError(spouseIdCard, true, "Spouse ID card")
        : "";
      setFileError(spouseIdCard, spouseIdCardError, error);
      return error;
    }

    employeeIdCard.addEventListener("change", validateEmployeeIdCard);
    spouseIdCard.addEventListener("change", validateSpouseIdCard);

    // Dynamic Kids Blocks
    function createKidBlock(index) {
      const number = index + 1;
      const block = document.createElement("div");
      block.className = "sub-card kid-block";
      block.dataset.index = String(index);

      block.innerHTML =
        '<div class="sub-card-title">Child ' + number + '</div>' +
        '<div class="form-group">' +
        '  <label for="kidName_' + index + '">Kid Name <span class="required">*</span></label>' +
        '  <input type="text" id="kidName_' + index + '" class="kid-name" placeholder="Enter child name" required />' +
        '</div>' +
        '<div class="form-group">' +
        '  <label for="kidAge_' + index + '">Kid Age (in years) <span class="required">*</span></label>' +
        '  <input type="number" id="kidAge_' + index + '" class="kid-age" min="0" max="17" step="1" inputmode="numeric" placeholder="Enter age" required />' +
        '</div>' +
        '<div class="form-group">' +
        '  <label for="kidHeight_' + index + '">Kid Height <span class="required">*</span></label>' +
        '  <select id="kidHeight_' + index + '" class="kid-height" required>' +
        '    <option value="">Select height</option>' +
        '    <option value="' + ABOVE_LABEL + '">' + ABOVE_LABEL + '</option>' +
        '    <option value="' + BELOW_LABEL + '">' + BELOW_LABEL + '</option>' +
        '  </select>' +
        '</div>' +
        '<div class="form-group">' +
        '  <label for="kidTicket_' + index + '">Wonderla Ticket Required? <span class="required">*</span></label>' +
        '  <select id="kidTicket_' + index + '" class="kid-ticket" required>' +
        '    <option value="">Select an option</option>' +
        '    <option value="Yes">Yes</option>' +
        '    <option value="No">No</option>' +
        '  </select>' +
        '</div>';

      block.querySelector(".kid-height").addEventListener("change", updateSummary);
      block.querySelector(".kid-ticket").addEventListener("change", updateSummary);
      return block;
    }

    function getKidsCountValue() {
      const value = kidsCount.value.trim();
      const count = Number(value);
      return /^\\d+$/.test(value) && count >= 1 && count <= MAX_KIDS ? count : 0;
    }

    function renderKidBlocks() {
      const bringingKids = kids.value === "Yes";
      const count = bringingKids ? getKidsCountValue() : 0;

      while (kidsContainer.children.length > count) {
        kidsContainer.lastElementChild.remove();
      }
      while (kidsContainer.children.length < count) {
        kidsContainer.appendChild(createKidBlock(kidsContainer.children.length));
      }

      kidsContainer.style.display = count > 0 ? "flex" : "none";

      const rawCount = kidsCount.value.trim();
      const countInvalid = bringingKids && rawCount !== "" && count === 0;
      kidsCountError.textContent = countInvalid
        ? "Please select the number of kids."
        : "";
      kidsCount.classList.toggle("input-error", countInvalid);

      updateSummary();
    }

    kids.addEventListener("change", function () {
      const show = this.value === "Yes";
      showField("kidsCountGroup", show);
      setRequired(kidsCount, show);
      if (!show) {
        kidsCount.value = "";
      }
      renderKidBlocks();
    });

    kidsCount.addEventListener("change", renderKidBlocks);

    function collectKids() {
      if (kids.value !== "Yes") return [];
      return Array.from(kidsContainer.querySelectorAll(".kid-block")).map(function (block) {
        return {
          name: block.querySelector(".kid-name").value.trim(),
          childName: block.querySelector(".kid-name").value.trim(),
          age: block.querySelector(".kid-age").value.trim(),
          heightEligibility: block.querySelector(".kid-height").value,
          ticketRequired: block.querySelector(".kid-ticket").value
        };
      });
    }

    function getTicketSummary() {
      const spouseIsAttending = isSpouseAttending();
      const kidsList = collectKids();

      const kidsAbove = kidsList.filter((k) => k.heightEligibility === ABOVE_LABEL).length;
      const kidsBelow = kidsList.filter((k) => k.heightEligibility === BELOW_LABEL).length;
      const kidsTickets = kidsList.filter((k) => k.ticketRequired === "Yes").length;

      const employeeTicketValue = employeeTicket.value;
      const spouseTicketValue = spouseIsAttending ? spouseTicket.value : "No";

      const total =
        (employeeTicketValue === "Yes" ? 1 : 0) +
        (spouseTicketValue === "Yes" ? 1 : 0) +
        kidsTickets;

      return {
        employeeTicket: employeeTicketValue,
        spouseAttending: spouseIsAttending,
        spouseTicket: spouseTicketValue,
        kidsList: kidsList,
        kidsCount: kidsList.length,
        kidsAbove: kidsAbove,
        kidsBelow: kidsBelow,
        total: total
      };
    }

    function updateSummary() {
      const summary = getTicketSummary();
      document.getElementById("sumEmployee").textContent = summary.employeeTicket || "—";
      document.getElementById("sumSpouse").textContent = summary.spouseAttending
        ? (summary.spouseTicket || "—")
        : "No (not attending)";
      document.getElementById("sumKids").textContent = String(summary.kidsCount);
      document.getElementById("sumKidsAbove").textContent = String(summary.kidsAbove);
      document.getElementById("sumKidsBelow").textContent = String(summary.kidsBelow);
      document.getElementById("sumTotal").textContent = String(summary.total);
    }

    function findKidsError() {
      if (kids.value !== "Yes") return null;
      if (getKidsCountValue() === 0) {
        return { element: kidsCount, message: "Please select how many kids are accompanying you." };
      }

      const blocks = Array.from(kidsContainer.querySelectorAll(".kid-block"));
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const label = "Child " + (i + 1);
        const nameEl = block.querySelector(".kid-name");
        const ageEl = block.querySelector(".kid-age");
        const heightEl = block.querySelector(".kid-height");

        if (!nameEl.value.trim()) {
          return { element: nameEl, message: label + ": please enter the name." };
        }

        const ageValue = ageEl.value.trim();
        const age = Number(ageValue);
        if (!/^\\d+$/.test(ageValue) || age < 0 || age > 17) {
          return { element: ageEl, message: label + ": age must be a whole number between 0 and 17." };
        }

        if (heightEl.value !== ABOVE_LABEL && heightEl.value !== BELOW_LABEL) {
          return { element: heightEl, message: label + ": please select ABOVE 75 CM or BELOW 75 CM." };
        }

        const ticketEl = block.querySelector(".kid-ticket");
        if (ticketEl.value !== "Yes" && ticketEl.value !== "No") {
          return { element: ticketEl, message: label + ": please select whether a Wonderla ticket is required." };
        }
      }
      return null;
    }

    function showToast(text, type, duration) {
      type = type || "info";
      duration = duration || 5000;
      const toast = document.createElement("div");
      toast.className = "toast " + type;
      toast.setAttribute("role", type === "error" ? "alert" : "status");

      const icon = document.createElement("span");
      icon.className = "toast-icon";
      icon.textContent = type === "success" ? "✓" : type === "error" ? "!" : "i";

      const content = document.createElement("span");
      content.textContent = String(text || "");

      toast.append(icon, content);
      toastContainer.appendChild(toast);

      requestAnimationFrame(() => toast.classList.add("show"));

      window.setTimeout(() => {
        toast.classList.remove("show");
        window.setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error('Unable to read the file "' + file.name + '".'));
        reader.readAsDataURL(file);
      });
    }

    async function buildFilePayload(file) {
      if (!file) return null;
      return {
        fileName: file.name,
        mimeType: ALLOWED_FILE_TYPES[getFileExtension(file.name)] || file.type,
        data: await fileToBase64(file)
      };
    }

    let submissionPending = false;

    function finishSubmission(success, responseMessage) {
      submissionPending = false;
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Registration";

      if (success) {
        showToast(
          responseMessage || "Your registration has been submitted successfully!",
          "success",
          6000
        );
        form.reset();
        emailError.textContent = "";
        mobileError.textContent = "";
        email.classList.remove("input-error");
        mobileNumber.classList.remove("input-error");

        showField("addressGroup", false);
        showField("kidsCountGroup", false);
        document.getElementById("spouseIdCardRequired").style.display = "none";
        showField("spouseTicketCard", false);

        setRequired(address, false);
        setRequired(kidsCount, false);
        setRequired(spouseIdCard, false);
        setRequired(spouseTicket, false);

        kidsContainer.innerHTML = "";
        kidsContainer.style.display = "none";

        syncEmployeeName();
        updateSpouseFields();
      } else {
        showToast(responseMessage || "Registration failed. Please try again.", "error", 8000);
      }
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (submissionPending) {
        showToast("Your registration is already being submitted. Please wait.", "info");
        return;
      }

      if (!validateEmail()) {
        email.focus();
        return;
      }

      if (!validateMobile()) {
        mobileNumber.focus();
        return;
      }

      if (!form.reportValidity()) return;

      const employeeFileError = validateEmployeeIdCard();
      if (employeeFileError) {
        showToast(employeeFileError, "error");
        employeeIdCard.focus();
        return;
      }

      const spouseFileError = validateSpouseIdCard();
      if (spouseFileError) {
        showToast(spouseFileError, "error");
        spouseIdCard.focus();
        return;
      }

      const kidsError = findKidsError();
      if (kidsError) {
        showToast(kidsError.message, "error");
        kidsError.element.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
      submissionPending = true;

      try {
        const summary = getTicketSummary();
        const spouseIsAttending = summary.spouseAttending;

        const employeeFile = await buildFilePayload(employeeIdCard.files[0]);
        const spouseFile = spouseIsAttending
          ? await buildFilePayload(spouseIdCard.files[0])
          : null;

        const kidsList = summary.kidsList;

        const formDataPayload = {
          name: nameInput.value.trim(),
          employeeName: nameInput.value.trim(),
          companyName: document.getElementById("companyName").value.trim(),
          designation: document.getElementById("designation").value.trim(),
          email: email.value.trim(),
          mobileNumber: mobileNumber.value.trim(),
          contactNumber: mobileNumber.value.trim(),

          cabReq: cabReq.value,
          cabRequired: cabReq.value,
          address: cabReq.value === "Yes" ? address.value.trim() : "",
          pickupAddress: cabReq.value === "Yes" ? address.value.trim() : "",

          spouseAttending: spouseIsAttending ? "Yes" : "No",
          spouseName: spouseIsAttending ? spouseName.value.trim() : "",

          employeeHeightEligibility: ABOVE_LABEL,
          employeeTicket: summary.employeeTicket,
          employeeTicketRequired: summary.employeeTicket,
          spouseHeightEligibility: spouseIsAttending ? ABOVE_LABEL : "",
          spouseTicket: spouseIsAttending ? summary.spouseTicket : "",
          spouseTicketRequired: spouseIsAttending ? summary.spouseTicket : "",

          kids: kids.value,
          bringingKids: kids.value,
          kidsCount: kids.value === "Yes" ? kidsList.length : 0,
          kidsDetails: kidsList,

          employeeFile: employeeFile,
          spouseFile: spouseFile,

          kidsAbove75: summary.kidsAbove,
          kidsBelow75: summary.kidsBelow,
          totalTickets: summary.total
        };

        const postBody = {
          templateId: "${template._id}",
          slug: "${template.slug}",
          idempotencyKey: idempotencyInput.value || generateUUID(),
          data: formDataPayload
        };

        const response = await fetch(SUBMIT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(postBody)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          finishSubmission(
            true,
            "Registration submitted successfully! Confirmation ID: " + (result.data?.registrationId || result.registrationId || "SAVED")
          );
        } else {
          finishSubmission(
            false,
            result.error || result.message || "Registration submission failed."
          );
        }
      } catch (err) {
        console.error("Submission error:", err);
        finishSubmission(false, err.message || "Network error. Please try again.");
      }
    });

    syncEmployeeName();
    updateSummary();
  </script>
</body>

</html>`;
}

export default generateWonderlaHtml;

