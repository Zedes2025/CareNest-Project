import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_URL
});

export async function summarizeText(text: string): Promise<string> {
  const prompt = `
Summarize the following document in a short paragraph in English language (maximum 3-4 sentences).

Requirements:
- Keep only the core message.
-start with "This document is about..." or simillar phrase to make it clear it's a summary.
- If a deadline exists, explicitly mention it in the summary.
- If the reader needs to take an action, clearly mention the required action.
- If there is no deadline or action, do not invent one.
- Be concise and clear.

Document:
${text}
`;
  // Placeholder implementation - replace with actual AI summarization logic
  const completion = await openai.chat.completions.create({
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    messages: [
      { role: 'system', content: 'You summarize document text.' },
      { role: 'user', content: prompt }
    ],

    max_tokens: 500,
    temperature: 0.5
  });
  const summary = completion.choices[0]?.message.content || 'No summary generated';
  return summary;
}
