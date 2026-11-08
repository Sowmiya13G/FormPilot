import { describe, it, expect } from 'vitest';
import { validateRegistrationData } from '@/lib/validations/registration';

describe('Indian Mobile Number Validation & Registration Rules', () => {
  const indianMobileRegex = /^[6-9]\d{9}$/;

  it('should accept valid 10-digit Indian numbers starting with 6, 7, 8, 9', () => {
    expect(indianMobileRegex.test('9876543210')).toBe(true);
    expect(indianMobileRegex.test('8888888888')).toBe(true);
    expect(indianMobileRegex.test('7123456789')).toBe(true);
    expect(indianMobileRegex.test('6999999999')).toBe(true);
  });

  it('should reject invalid mobile numbers', () => {
    // Starting with 0, 1, 2, 3, 4, 5
    expect(indianMobileRegex.test('0123456789')).toBe(false);
    expect(indianMobileRegex.test('5555555555')).toBe(false);
    // Invalid length
    expect(indianMobileRegex.test('987654321')).toBe(false); // 9 digits
    expect(indianMobileRegex.test('98765432101')).toBe(false); // 11 digits
    // Non-digit characters
    expect(indianMobileRegex.test('98765abcd0')).toBe(false);
  });

  it('should flag invalid contactNumber in validateRegistrationData', () => {
    const invalidRes = validateRegistrationData({
      contactNumber: '1234567890',
    });
    expect(invalidRes.isValid).toBe(false);
    expect(invalidRes.errors['contactNumber']).toBeDefined();

    const validRes = validateRegistrationData({
      contactNumber: '9876543210',
    });
    expect(validRes.isValid).toBe(true);
    expect(validRes.sanitizedData['contactNumber']).toBe('9876543210');
  });

  it('should require pickup location when cabRequired is Yes', () => {
    const withoutPickup = validateRegistrationData({
      cabRequired: 'Yes',
      cabPickupLocation: '',
    });
    expect(withoutPickup.isValid).toBe(false);
    expect(withoutPickup.errors['cabPickupLocation']).toBeDefined();

    const withPickup = validateRegistrationData({
      cabRequired: 'Yes',
      cabPickupLocation: 'Marathahalli Bridge, Bangalore',
    });
    expect(withPickup.isValid).toBe(true);
  });

  it('should reject children with age over 17', () => {
    const overageKid = validateRegistrationData({
      bringingKids: 'Yes',
      kids: [
        {
          childName: 'Rahul',
          age: 19,
          heightEligibility: 'ABOVE 75 CM',
          ticketRequired: 'Yes',
        },
      ],
    });
    expect(overageKid.isValid).toBe(false);
    expect(overageKid.errors['kids[0]']).toContain('17 years');
  });

  it('should reject more than 3 children per registration', () => {
    const fourKids = validateRegistrationData({
      bringingKids: 'Yes',
      kids: [
        { childName: 'C1', age: 5, heightEligibility: 'ABOVE 75 CM', ticketRequired: 'Yes' },
        { childName: 'C2', age: 7, heightEligibility: 'ABOVE 75 CM', ticketRequired: 'Yes' },
        { childName: 'C3', age: 9, heightEligibility: 'ABOVE 75 CM', ticketRequired: 'Yes' },
        { childName: 'C4', age: 11, heightEligibility: 'ABOVE 75 CM', ticketRequired: 'Yes' },
      ],
    });
    expect(fourKids.isValid).toBe(false);
    expect(fourKids.errors['kids']).toContain('maximum of 3 children');
  });
});

