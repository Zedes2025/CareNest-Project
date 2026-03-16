import { z } from 'zod';

export const promptSchema = z.strictObject({
  prompt: z
    .string()
    .min(2, 'Prompt cannot be empty')
    .max(1000, 'Prompt cannot exceed 1000 characters'),
  chatId: z.string().nullable().optional() //  to fix error in validation middleware when chatId is not provided
});

export const docSchema = z.strictObject({});
