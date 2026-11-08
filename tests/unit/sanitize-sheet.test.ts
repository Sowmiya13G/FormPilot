import { describe, it, expect } from 'vitest';
import { sanitizeForSheet, formatPhoneForSheet } from '@/lib/security/sanitize-sheet';

describe('Google Sheets Formula Sanitizer', () => {
  it('should escape formula injection triggers (=, +, -, @) with a leading single quote', () => {
    expect(sanitizeForSheet('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeForSheet('+cmd|/c calc.exe')).toBe("'+cmd|/c calc.exe");
    expect(sanitizeForSheet('-2+3*cmd')).toBe("'-2+3*cmd");
    expect(sanitizeForSheet('@IMPORTXML(...)')).toBe("'@IMPORTXML(...)");
  });

  it('should leave normal safe text untouched', () => {
    expect(sanitizeForSheet('John Doe')).toBe('John Doe');
    expect(sanitizeForSheet('Wonderla Kochi Resort')).toBe('Wonderla Kochi Resort');
    expect(sanitizeForSheet('user@wonderla.com')).toBe('user@wonderla.com');
  });

  it('should preserve null or undefined as empty string', () => {
    expect(sanitizeForSheet(null)).toBe('');
    expect(sanitizeForSheet(undefined)).toBe('');
  });

  it('should format Indian mobile numbers with a leading single quote', () => {
    expect(formatPhoneForSheet('9876543210')).toBe("'9876543210");
    expect(formatPhoneForSheet("'9876543210")).toBe("'9876543210");
  });
});

