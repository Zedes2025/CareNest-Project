import { z } from 'zod';

export const promptSchema = z.strictObject({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(1000, 'Prompt cannot exceed 1000 characters')
});
