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

// import type { RequestHandler } from 'express';
// import OpenAI from 'openai';
// import type { ChatCompletionMessageParam } from 'openai/resources';
// import type { z } from 'zod';
// import type { promptSchema } from '#schemas';

// // type PromptDTO = z.infer<typeof promptSchema>;
// type CompletionDTO = { completion: string };

// // declared outside of function, to persist across API calls. Will reset if server stops/restarts
// const messages: ChatCompletionMessageParam[] = [
//   { role: 'developer', content: 'You are a helpful assistant' }
// ];

// //-----------------------------------Hard code for Testing-----------------------------------
// interface PromptDTO {
//   prompt: string;
//   userId?: string;
// }

// const userProfiles: { [key: string]: { age: number; interests: string[] } } = {
//   '69a5a26d06c34a44fee74713': {
//     age: 80,
//     interests: ['need assistance for reading', 'need shopping help']
//   },
//   '69a5a26d06c34a44fee74717': { age: 35, interests: ['babysitting', 'dog watching'] },
//   '69a5a26d06c34a44fee74719': { age: 50, interests: ['cooking', 'offer baking'] },
//   '69a5a26d06c34a44fee74721': { age: 70, interests: ['shopping', 'watching after kids'] },
//   '69a5a26d06c34a44fee74723': { age: 18, interests: ['shopping', 'watching movies'] }
// };

// //___________________________________________________________________

// // Example app info
// const appInfo = `
// CareNnest is a community support platform that connects people who want to lend a hand with those in need.
// Through the application, users can:
// - Connect with neighbors and build strong community bonds
// - Assist elderly or visually-impaired users to read documents via an AI voice assistant
// - Participate in local activities and support initiatives
// - People should message each other, to get support.
// For over 65 users, emphasize the assistance features, with warmer tone. `;
// export const createAiChat: RequestHandler<{}, CompletionDTO, PromptDTO> = async (req, res) => {
//   const { prompt, userId } = req.body;
//   const client = new OpenAI({
//     apiKey: process.env.AI_API_KEY,
//     baseURL: process.env?.AI_URL
//   });

//   // System prompt with app info
//   const systemPrompt: ChatCompletionMessageParam = {
//     role: 'system',
//     content: `
// You are a professional, friendly assistant for the CareNest community app.You determine if a question is about this app.
// If  not,  do not answer. Ask people to contact each other directly for support.
// Always use the following information to answer all questions accurately:
// ${appInfo}
// encourage users logging in if not already logged in.
// `
//   };
//   const userProfile = userId ? userProfiles[userId] : null;
//   let userPromptContent = '';
//   if (userProfile) {
//     userPromptContent = `
// The user is ${userProfile.age} years old and offres/needs ${userProfile.interests.join(', ')}.
// Question: "${prompt}"
// `;
//   } else {
//     userPromptContent = `
// A new visitor asks: "${prompt}"
// `;
//   }
//   messages.push(systemPrompt);

//   messages.push({ role: 'user', content: userPromptContent });

//   const completion = await client.chat.completions.create({
//     model: process.env.AI_MODEL || 'gemini-2.5-flash',
//     messages,
//     max_tokens: 400
//   });

//   const completionText = completion.choices[0]?.message.content || 'No completion generated';

//   messages.push({ role: 'assistant', content: completionText });
//   res.json({ completion: completionText });
// };
