import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_URL
});

type AiResponse = {
  summary: string;
  deadline: string | null;
  actionRequired: string | null;
};
export async function summarizeText(text: string): Promise<AiResponse> {
  const prompt = `
You are a document analysis assistant.

Analyze the document and extract the following information.
-start with "This document is about..." or simillar phrase to make it clear it's a summary.
- If a deadline exists, explicitly mention it in the summary.
-Return ONLY valid JSON with this exact structure:

{
  "summary": "short summary (max 3 sentences)",
  "deadline": "deadline mentioned in the document or null (max 3-4 words). Avoid non-English words",
  "actionRequired": "action the reader must take or null (max 3-4 words). Avoid non-English words"
}

Rules:
- If there is no deadline, return null.
- If there is no required action, return null.
- Do not invent deadlines or actions.
- Keep the summary concise and focused on the core message.
- Do not include any text outside the JSON.

Document:
${text}
`;

  const completion = await openai.chat.completions.create({
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    messages: [
      {
        role: 'system',
        content: 'You analyze documents and return structured information in english language.'
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.5
  });

  // get AI output
  const content = completion.choices?.[0]?.message?.content || '{}';

  // remove Markdown wrappers like ```json
  const cleaned = content
    .replace(/```(?:json)?/g, '')
    .replace(/```/g, '')
    .trim();

  // parse JSON safely
  let parsed: AiResponse;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse AI response:', cleaned);
    parsed = { summary: '', deadline: null, actionRequired: null };
  }

  // ensure all fields exist
  return {
    summary: parsed.summary || '',
    deadline: parsed.deadline ?? null,
    actionRequired: parsed.actionRequired ?? null
  };
}
