import type { RequestHandler } from 'express';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';
import { Chat } from '#models'; // MongoDB model on AI server

type CompletionDTO = { completion: string; chatId: string };

interface PromptDTO {
  prompt: string;
  chatId?: string; // optional for continuing chat
}

const appInfo = `
CareNnest is a community support platform that connects people who want to lend a hand with those in need or finding a mate for a local activity. 
Through the application, users can:
- Connect with neighbors and build strong community bonds
- Assist people to summarize and read documents via AI  and TTS features
- Participate in local activities and support initiatives
- People should message each other, to get support. 
- On home page, users are listed according to their proximity, with the closest ones at the top.
 `;

export const createAiChat: RequestHandler<{}, CompletionDTO, PromptDTO> = async (req, res) => {
  const { prompt, chatId } = req.body;

  // --- get authenticated user from middleware ---
  const { user: userInfo } = req;
  const userId = userInfo?.id || null; // null if unauthenticated (blind chat)

  console.log('User ID:', req.user?.id); // log user info for debugging
  const client = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env?.AI_URL
  });

  // --- load existing chat or create new ---
  let currentChat = chatId ? await Chat.findById(chatId) : null;
  if (!currentChat) {
    currentChat = await Chat.create({ history: [] });
  }

  // System prompt
  const systemPrompt: ChatCompletionMessageParam = {
    role: 'system',
    content: `
You are a professional assistant for the CareNest community app. 
Answer briefly and accurately, maximum 3 sentences. You determine if a question is about this app.
If not, do not answer. Ask people to contact each other directly for support. 
Always use the following information to answer all questions accurately:
${appInfo}
If the user is not logged in, encourage them to log in.
If the user is logged in, do not mention logging in.
`
  };

  // User prompt
  const userPromptContent = userId
    ? `A registered user (ID: ${userId}) asks: "${prompt}". The user is logged in.`
    : `A visitor (unregistered) asks: "${prompt}". The user is not logged in.`;

  // ---Adds system and user messages to the chat history
  currentChat.history.push(systemPrompt);
  currentChat.history.push({ role: 'user', content: userPromptContent });

  // Call LLM
  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    messages: currentChat.history.map(m => ({ role: m.role, content: m.content })),
    max_tokens: 400
  });

  const completionText = completion.choices[0]?.message.content || 'No completion generated';

  // --- store assistant response ---
  currentChat.history.push({ role: 'assistant', content: completionText });
  await currentChat.save();

  //returns completion and chatId
  res.json({
    completion: completionText,
    chatId: currentChat._id.toString()
  });
};
