import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { text } from 'node:stream/consumers';

export const promptSchema = z.strictObject({
  prompt: z
    .string()
    .min(2, 'Prompt cannot be empty')
    .max(1000, 'Prompt cannot exceed 1000 characters'),
  chatId: z.string().nullable().optional() //  to fix error in validation middleware when chatId is not provided
});

export const docSchema = z.strictObject({
  fileName: z
    .string()
    .min(7, 'File name is required')
    .regex(/\.[a-zA-Z0-9]+$/, 'File name must include a file extension'),
  text: z.string().min(1, 'Document text is empty')
});

export const deleteDocSchema = z.strictObject({
  id: z.string().refine(isValidObjectId, 'Invalid document ID')
});
