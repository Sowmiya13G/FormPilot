export interface EmailTemplateParams {
  subject: string;
  body: string;
  registrationUrl: string;
  bannerImageUrl?: string;
  fallbackText?: string;
  signatureHtml?: string;
  organizationName?: string;
}

/**
 * Builds responsive, cross-client HTML email template (Gmail, Outlook, Apple Mail)
 */
export function buildEmailHtml(params: EmailTemplateParams): string {
  const {
    subject,
    body,
    registrationUrl,
    bannerImageUrl,
    fallbackText = 'Register for the Event',
    signatureHtml,
    organizationName = 'FormPilot Event Management',
  } = params;

  // Format line breaks in body into HTML paragraphs if raw text
  const formattedBody = body.includes('<p>') || body.includes('<div>')
    ? body
    : body
        .split('\n\n')
        .map((paragraph) => `<p style="margin: 0 0 16px 0; line-height: 1.6;">${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          ${
            bannerImageUrl
              ? `
          <!-- Clickable Banner -->
          <tr>
            <td style="padding: 0; line-height: 0;">
              <a href="${escapeHtml(registrationUrl)}" target="_blank" style="display: block; text-decoration: none;">
                <img src="${escapeHtml(bannerImageUrl)}" alt="${escapeHtml(fallbackText)}" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0;" />
              </a>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; color: #1e293b; font-size: 15px;">
              ${formattedBody}

              <!-- Call To Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(registrationUrl)}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 10px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                      Register for Event &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">
                If the button above does not work, copy and paste this link into your browser:<br />
                <a href="${escapeHtml(registrationUrl)}" target="_blank" style="color: #2563eb; word-break: break-all;">${escapeHtml(registrationUrl)}</a>
              </p>

              ${
                signatureHtml
                  ? `
              <!-- Email Signature -->
              <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #475569; font-size: 13px; line-height: 1.5;">
                ${signatureHtml}
              </div>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
              <span>&copy; ${new Date().getFullYear()} ${escapeHtml(organizationName)}. All rights reserved.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds plain-text fallback version for terminal or non-HTML email readers
 */
export function buildPlainTextFallback(params: EmailTemplateParams): string {
  const { subject, body, registrationUrl } = params;
  const cleanBody = body.replace(/<[^>]*>?/gm, '');

  return `${subject}\n\n${cleanBody}\n\nRegister here:\n${registrationUrl}\n\n--\nFormPilot Event Management`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

