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
CareNnest is a community support platform that connects people who want to lend a hand with those in need. 
Through the application, users can:
- Connect with neighbors and build strong community bonds
- Assist elderly or visually-impaired users to read documents via an AI voice assistant
- Participate in local activities and support initiatives
- People should message each other, to get support. 
For over 65 users, emphasize the assistance features, with warmer tone. `;

export const createAiChat: RequestHandler<{}, CompletionDTO, PromptDTO> = async (req, res) => {
  const { prompt, chatId } = req.body;

  // --- get authenticated user from middleware ---
  const { user: userInfo } = req;
  const userId = userInfo?.id || null; // null if unauthenticated (blind chat)
  console.log('User ID:', req.user?.id);
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
You are a professional, friendly assistant for the CareNest community app. You determine if a question is about this app.
If not, do not answer. Ask people to contact each other directly for support. 
Always use the following information to answer all questions accurately:
${appInfo}
Encourage users logging in if not already logged in.
`
  };

  // User prompt
  const userPromptContent = userId
    ? `A registered user (ID: ${userId}) asks: "${prompt}"`
    : `A visitor (unregistered) asks: "${prompt}"`;

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
