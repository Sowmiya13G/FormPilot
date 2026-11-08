import { z } from 'zod';

export const inviteUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  name: z.string().trim().min(1, 'Name is required').optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER'], {
    message: 'Role must be ADMIN, EDITOR, or VIEWER',
  }).default('VIEWER'),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
  active: z.boolean().optional(),
  name: z.string().trim().min(1).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

