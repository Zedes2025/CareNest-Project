import type { RequestHandler } from 'express';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';
import type { z } from 'zod';
import type { promptSchema } from '#schemas';

type PromptDTO = z.infer<typeof promptSchema>;
type CompletionDTO = { completion: string };

// declared outside of function, to persist across API calls. Will reset if server stops/restarts
const messages: ChatCompletionMessageParam[] = [
  { role: 'developer', content: 'You are a helpful assistant' }
];

export const createInMemoryChat: RequestHandler<{}, CompletionDTO, PromptDTO> = async (
  req,
  res
) => {
  const { prompt } = req.body;

  const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env?.AI_URL
  });

  messages.push({ role: 'user', content: prompt });

  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    messages
  });

  const completionText = completion.choices[0]?.message.content || 'No completion generated';

  messages.push({ role: 'assistant', content: completionText });

  res.json({ completion: completionText });
};
