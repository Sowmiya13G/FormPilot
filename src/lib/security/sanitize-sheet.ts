/**
 * Sanitizes input values to prevent CSV / Spreadsheet formula injection vulnerabilities.
 * Strings starting with '=', '+', '-', or '@' can execute arbitrary code in Microsoft Excel
 * and Google Sheets if opened by users or administrators.
 */
export function sanitizeForSheet(value: unknown): string {
  if (value === null || value === undefined) return '';

  let str: string;
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      str = value
        .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
        .join('; ');
    } else {
      str = JSON.stringify(value);
    }
  } else {
    str = String(value);
  }

  // If string begins with formula triggers (=, +, -, @), prepend with a single quote
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }

  return str;
}

/**
 * Formats Indian phone numbers to preserve leading zeros in spreadsheets
 */
export function formatPhoneForSheet(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.trim();
  return cleaned.startsWith("'") ? cleaned : `'${cleaned}`;
}

