# A simple server for working with OpenAI's Chat Completions API (compatible with most LLMs)

This project provides a simple server for working with Open AI's SDK via the chat completions API, with chat history stored in memory

## Installation

- Click `Use this template` on GitHub to make a copy of the repo

- Install dependencies:

```bash
npm install
```

### Get an LLM API Key

This API is compatible with OpenAI, Gemini, and Anthropic API keys

- Gemini is recommended for it's generous free tier, or OpenAI for ease of use with OpenAI's SDK

### Continue project Setup

- Rename `example.env` to `.env.development.local` and add your variables. An example with Gemini could look like this

```
AI_API_KEY=asdfhlweuilsadflkjsf
AI_MODEL=gemini-2.5-flash
AI_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

- Run

```bash
npm run dev
```

## Endpoints

Currently, this API supports

- In-memory Chat: `POST` `/ai/in-memory-chat`
  - A basic implementation, holds the chat history in memory

## Sample request

```json
{
  "prompt": "How do I save to local storage?"
}
```

## Server setup checklist

### `POST` `/ai/in-memory-chat`

- Make a request to this endpoint
- Look at the `createSimpleChat` function in `controllers/completions.ts`
- Update the `content` of the `developer` message to change the "voice" of the AI assistant
- Note the structure of the `messages` variable
- Consider what you would need to add to save the chat history in MongoDB
