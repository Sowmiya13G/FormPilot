import { IThemeConfig } from '@/types';

export function compileEmbeddedCss(theme: IThemeConfig = {}): string {
  const primaryColor = theme.primaryColor || '#0284c7';
  const bgColor = theme.backgroundColor || '#f8fafc';
  const fontFamily = theme.fontFamily || 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  return `
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: ${fontFamily};
      background-color: ${bgColor};
      color: #1e293b;
      line-height: 1.5;
      padding: 24px 16px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      ${theme.backgroundImageUrl ? `background-image: url('${theme.backgroundImageUrl}'); background-size: cover; background-position: center; background-attachment: fixed;` : ''}
    }

    .form-wrapper {
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .banner-container {
      width: 100%;
      max-height: 240px;
      overflow: hidden;
      background-color: #f1f5f9;
    }

    .banner-container img {
      width: 100%;
      height: 100%;
      max-height: 240px;
      object-fit: cover;
      display: block;
    }

    .form-header {
      padding: 28px 28px 20px;
      border-bottom: 1px solid #f1f5f9;
    }

    .form-title {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .form-desc {
      font-size: 14px;
      color: #64748b;
      margin-top: 6px;
    }

    .form-body {
      padding: 28px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 18px;
    }

    .col-12 { grid-column: span 12; }
    .col-6 { grid-column: span 12; }
    .col-4 { grid-column: span 12; }

    @media (min-width: 640px) {
      .col-6 { grid-column: span 6; }
      .col-4 { grid-column: span 4; }
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-group.is-hidden {
      display: none !important;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }

    .req {
      color: #ef4444;
      margin-left: 2px;
    }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="number"],
    input[type="date"],
    select,
    textarea {
      width: 100%;
      padding: 10px 14px;
      font-size: 14px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background-color: #ffffff;
      color: #0f172a;
      transition: border-color 0.15s, box-shadow 0.15s;
      outline: none;
    }

    input:focus, select:focus, textarea:focus {
      border-color: ${primaryColor};
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
    }

    input.input-error, select.input-error, textarea.input-error {
      border-color: #ef4444 !important;
      background-color: #fffaf0;
    }

    .field-error {
      font-size: 12px;
      color: #ef4444;
      display: none;
    }

    .field-error.visible {
      display: block;
    }

    .field-help {
      font-size: 11px;
      color: #94a3b8;
    }

    .radio-group, .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 4px;
    }

    .choice-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 400;
      color: #334155;
      cursor: pointer;
    }

    .file-dropzone {
      border: 2px dashed #cbd5e1;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      background: #f8fafc;
      cursor: pointer;
      transition: border-color 0.15s, background-color 0.15s;
    }

    .file-dropzone:hover {
      border-color: ${primaryColor};
      background: #f0f9ff;
    }

    .file-name-preview {
      margin-top: 8px;
      font-size: 12px;
      font-weight: 600;
      color: ${primaryColor};
      word-break: break-all;
    }

    /* Repeatable Kids Section */
    .repeatable-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .child-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      position: relative;
    }

    .child-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
    }

    .child-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .btn-remove-child {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 12px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-add-child {
      background: #f1f5f9;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      align-self: flex-start;
      transition: background-color 0.15s;
    }

    .btn-add-child:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .btn-add-child:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Ticket Summary Banner */
    .ticket-summary-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 18px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 20px 0 10px;
    }

    .summary-title {
      font-size: 14px;
      font-weight: 700;
      color: #0369a1;
    }

    .summary-subtitle {
      font-size: 12px;
      color: #0284c7;
      margin-top: 2px;
    }

    .summary-counter {
      font-size: 28px;
      font-weight: 800;
      color: ${primaryColor};
    }

    /* Submit Button */
    .btn-submit {
      width: 100%;
      background-color: ${primaryColor};
      color: #ffffff;
      padding: 14px 24px;
      font-size: 15px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: opacity 0.15s, transform 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn-submit:hover:not(:disabled) {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      display: none;
      width: 18px;
      height: 18px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success / Error Banners */
    .alert-banner {
      display: none;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-banner.alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .alert-banner.alert-success {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }

    /* Toast Notifications */
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

    .toast.success { background: #16803c; }
    .toast.error { background: #c62828; }
    .toast.info { background: #32145e; }

    .toast-icon {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.2;
    }

    .success-screen {
      display: none;
      text-align: center;
      padding: 40px 20px;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #d1fae5;
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 32px;
      font-weight: bold;
    }

    .success-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }

    .success-text {
      font-size: 14px;
      color: #64748b;
      margin-top: 8px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
  `;
}

export default compileEmbeddedCss;

