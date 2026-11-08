import { describe, it, expect } from 'vitest';
import { publicRegistrationSubmissionSchema, validateRegistrationData } from '@/lib/validations/registration';
import { isOriginAllowed } from '@/lib/security/cors';
import { checkRateLimit } from '@/lib/rate-limit';

describe('Public Registration API Integration & Security Controls', () => {
  describe('Zod Submission Schema Validation', () => {
    it('should validate valid submission payload', () => {
      const payload = {
        templateId: '654321098765432109876543',
        idempotencyKey: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        data: {
          employeeName: 'Anoop Kumar',
          contactNumber: '9876543210',
        },
      };

      const result = publicRegistrationSubmissionSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject payload with short or missing idempotency key', () => {
      const payload = {
        templateId: '654321098765432109876543',
        idempotencyKey: 'short',
        data: {},
      };

      const result = publicRegistrationSubmissionSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('Server-Side Ticket Recalculation Override', () => {
    it('should recalculate tickets server-side and ignore client-tampered totals', () => {
      const clientSubmittedData = {
        employeeTicketRequired: 'Yes',
        spouseName: 'Meera',
        spouseTicketRequired: 'Yes',
        bringingKids: 'No',
        totalTickets: 10, // Client forged 10 tickets
      };

      const validation = validateRegistrationData(clientSubmittedData);
      expect(validation.isValid).toBe(true);
      // Server correctly recalculates 1 employee + 1 spouse = 2 tickets
      expect(validation.ticketSummary.totalTickets).toBe(2);
      expect(validation.ticketSummary.totalTickets).not.toBe(10);
    });
  });

  describe('CORS Origin Filtering', () => {
    it('should allow all origins when allowedOrigins contains "*"', () => {
      expect(isOriginAllowed('https://wonderla.com', ['*'])).toBe(true);
      expect(isOriginAllowed('http://localhost:3000', ['*'])).toBe(true);
      expect(isOriginAllowed(null, ['*'])).toBe(true);
    });

    it('should strictly allow only matched domains when specified', () => {
      const allowed = ['https://wonderla.com', 'https://events.wonderla.com'];
      expect(isOriginAllowed('https://wonderla.com', allowed)).toBe(true);
      expect(isOriginAllowed('https://events.wonderla.com', allowed)).toBe(true);
      expect(isOriginAllowed('https://malicious-site.com', allowed)).toBe(false);
    });
  });

  describe('In-Memory IP Rate Limiting', () => {
    it('should allow requests up to the configured limit and reject thereafter', () => {
      const testIp = '192.168.1.99';
      const limit = 5;

      for (let i = 0; i < limit; i++) {
        const res = checkRateLimit(testIp, { limit, windowMs: 10000 });
        expect(res.allowed).toBe(true);
      }

      // 6th request must be rejected
      const rejected = checkRateLimit(testIp, { limit, windowMs: 10000 });
      expect(rejected.allowed).toBe(false);
      expect(rejected.remaining).toBe(0);
    });
  });
});

