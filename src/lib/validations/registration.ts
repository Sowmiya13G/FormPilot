import { z } from 'zod';
import { calculateTicketSummary, ITicketSummary } from '@/features/templates/ticketCalculator';

export const childAttendeeSchema = z
  .object({
    name: z.string().optional(),
    childName: z.string().optional(),
    age: z
      .union([z.number(), z.string()])
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && val >= 0 && val <= 17, {
        message: 'Child age must be between 0 and 17 years',
      }),
    heightEligibility: z.enum(['ABOVE 75 CM', 'BELOW 75 CM'], {
      message: 'Height eligibility must be ABOVE 75 CM or BELOW 75 CM',
    }),
    ticketRequired: z.enum(['Yes', 'No']).default('Yes'),
  })
  .refine(
    (data) => Boolean((data.name && data.name.trim()) || (data.childName && data.childName.trim())),
    {
      message: 'Child name is required',
      path: ['childName'],
    }
  );

export const publicRegistrationSubmissionSchema = z.object({
  templateId: z.string().optional(),
  slug: z.string().optional(),
  idempotencyKey: z
    .string()
    .min(8, 'Idempotency key must be at least 8 characters')
    .max(128, 'Idempotency key exceeds 128 characters'),
  data: z.record(z.string(), z.unknown()),
});

export type PublicRegistrationSubmissionInput = z.infer<typeof publicRegistrationSubmissionSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  ticketSummary: ITicketSummary;
  sanitizedData: Record<string, unknown>;
}

/**
 * Validates registration data against business rules:
 * 1. Indian mobile phone numbers (^[6-9]\d{9}$)
 * 2. Cab pickup required if cabRequired === 'Yes' or cabReq === 'Yes'
 * 3. Spouse details if spouse is attending
 * 4. Children validation (max 3, ages 0-17)
 * 5. Server-side ticket recalculation
 */
export function validateRegistrationData(rawAnswers: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, unknown> = { ...rawAnswers };

  // 1. Mobile Number validation
  const phoneFields = ['mobileNumber', 'contactNumber', 'emergencyContactNumber', 'mobile', 'phone'];
  for (const field of phoneFields) {
    const val = rawAnswers[field];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      const cleanPhone = String(val).trim().replace(/[\s-]/g, '');
      const indianPhoneRegex = /^[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(cleanPhone)) {
        errors[field] = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
      } else {
        sanitizedData[field] = cleanPhone;
      }
    }
  }

  // 2. Cab Pickup validation
  if (rawAnswers['cabRequired'] === 'Yes' || rawAnswers['cabReq'] === 'Yes') {
    const pickupLoc =
      rawAnswers['cabPickupLocation'] || rawAnswers['address'] || rawAnswers['pickupAddress'];
    if (!pickupLoc || String(pickupLoc).trim().length === 0) {
      errors['cabPickupLocation'] = 'Cab pickup location/address is required when cab service is selected';
      errors['address'] = errors['cabPickupLocation'];
    }
  }

  // 3. Spouse validation
  const spouseName = rawAnswers['spouseName'];
  const hasSpouse = Boolean(spouseName && String(spouseName).trim().length > 0);
  if (rawAnswers['spouseAttending'] === 'Yes' || rawAnswers['hasSpouse'] === 'Yes') {
    if (!hasSpouse) {
      errors['spouseName'] = 'Spouse name is required if spouse is attending';
    }
  }

  // 4. Children validation
  if (rawAnswers['bringingKids'] === 'Yes' || rawAnswers['kids'] === 'Yes') {
    const rawKids = (rawAnswers['kidsDetails'] || rawAnswers['kids']) as unknown;
    if (!Array.isArray(rawKids) || rawKids.length === 0) {
      errors['kids'] = 'Please provide details for at least one child';
    } else if (rawKids.length > 3) {
      errors['kids'] = 'A maximum of 3 children may be registered per employee';
    } else {
      const validatedKids: Array<Record<string, unknown>> = [];
      rawKids.forEach((kid, idx) => {
        const parse = childAttendeeSchema.safeParse(kid);
        if (!parse.success) {
          const firstErr = parse.error.issues[0]?.message || 'Invalid child information';
          errors[`kids[${idx}]`] = firstErr;
        } else {
          validatedKids.push({
            ...parse.data,
            name: parse.data.name || parse.data.childName,
            childName: parse.data.childName || parse.data.name,
          });
        }
      });
      sanitizedData['kids'] = validatedKids;
      sanitizedData['kidsDetails'] = validatedKids;
    }
  }

  // 5. Strict Server-Side Ticket Recalculation
  const ticketSummary = calculateTicketSummary(sanitizedData);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    ticketSummary,
    sanitizedData,
  };
}
