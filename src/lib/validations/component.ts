import { z } from 'zod';

export const selectOptionSchema = z.object({
  label: z.string().trim().min(1, 'Option label is required'),
  value: z.string().trim().min(1, 'Option value is required'),
});

export const validationConfigSchema = z.object({
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  pattern: z.string().optional(),
  patternMessage: z.string().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  maxFileSize: z.number().positive().optional(), // in bytes, default 5242880
  allowedFileTypes: z.array(z.string()).optional(),
});

export const componentSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, 'Field key must be at least 2 characters')
    .max(50, 'Field key must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Field key must only contain letters, numbers, hyphens, and underscores')
    .toLowerCase(),
  label: z.string().trim().min(1, 'Field label is required').max(100),
  description: z.string().trim().optional(),
  type: z.enum([
    'text',
    'email',
    'tel',
    'number',
    'date',
    'select',
    'radio',
    'checkbox',
    'checkbox-group',
    'textarea',
    'file',
    'hidden',
    'section',
    'info',
    'repeatable',
  ]),
  category: z.enum([
    'Personal Details',
    'Travel & Stay',
    'ID & Verification',
    'Family & Kids',
    'Custom',
  ]).default('Custom'),
  placeholder: z.string().trim().optional(),
  helpText: z.string().trim().optional(),
  defaultValue: z.unknown().optional(),
  defaultRequired: z.boolean().default(false),
  options: z.array(selectOptionSchema).optional(),
  validationConfig: validationConfigSchema.optional(),
  active: z.boolean().default(true),
});

export type ComponentInput = z.infer<typeof componentSchema>;

export const updateComponentSchema = componentSchema.partial().omit({ key: true });
export type UpdateComponentInput = z.infer<typeof updateComponentSchema>;
