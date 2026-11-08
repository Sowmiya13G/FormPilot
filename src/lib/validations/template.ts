import { z } from 'zod';

export const conditionRuleSchema = z.object({
  fieldKey: z.string().trim().min(1, 'Target field is required'),
  operator: z.enum([
    'equals',
    'notEquals',
    'isEmpty',
    'isNotEmpty',
    'greaterThan',
    'lessThan',
    'contains',
  ]),
  value: z.unknown().optional(),
});

export const conditionalConfigSchema = z.object({
  action: z.enum(['show', 'hide']).default('show'),
  matchType: z.enum(['all', 'any']).default('all'),
  rules: z.array(conditionRuleSchema).default([]),
});

export const templateFieldSchema = z.object({
  componentKey: z.string().trim().min(1, 'Component reference key is required'),
  fieldKey: z
    .string()
    .trim()
    .min(1, 'Field key is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Field key must contain only letters, numbers, hyphens, and underscores'),
  label: z.string().trim().optional(),
  placeholder: z.string().trim().optional(),
  helpText: z.string().trim().optional(),
  required: z.boolean().optional(),
  order: z.number().int().default(0),
  width: z.enum(['full', 'half', 'third']).default('full'),
  conditionalConfig: conditionalConfigSchema.optional(),
  validationOverride: z.record(z.string(), z.unknown()).optional(),
});

export const themeConfigSchema = z.object({
  primaryColor: z.string().trim().optional(),
  backgroundColor: z.string().trim().optional(),
  backgroundImageUrl: z.string().trim().optional(),
  bannerImageUrl: z.string().trim().optional(),
  logoUrl: z.string().trim().optional(),
  fontFamily: z.string().trim().optional(),
});

export const createTemplateSchema = z.object({
  eventName: z.string().trim().min(2, 'Event name is required').max(100),
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .max(60, 'Slug must be at most 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens')
    .toLowerCase(),
  description: z.string().trim().optional(),
  fields: z.array(templateFieldSchema).default([]),
  theme: themeConfigSchema.optional(),
  allowedOrigins: z.array(z.string().trim()).optional(),
  driveFolderId: z.string().trim().optional(),
  spreadsheetId: z.string().trim().optional(),
  sheetTabId: z.string().trim().optional(),
  sheetMapping: z.record(z.string(), z.string()).optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial().omit({ slug: true });
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

