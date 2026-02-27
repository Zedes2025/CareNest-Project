# AI Simple Server with Persistent Memory

Currently a user's chat history is stored in-memory, so if the server stops the chat history is lost. All users all share a single chat history, which could get messy if you have more than one user. In this exercise, you will store the chat history in MongoDB via Mongoose

## Requirements

- `Chat` Mongoose model to store chat history
- `POST` `/ai/chat` will save both `user` and `assistant` messages to MongoDB and send the assistant message and `chatId` in the response body
  - Example request body

  ```json
  {
    "prompt": "Which backend framework would the Joker use?",
    "chatId": "698dd112c26bb3cfe26ff7a1" // optional property
  }
  ```

  - Example response body

  ```json
  {
    "completion": "The Joker wouldn't use a \"backend framework\" in the conventional sense, because frameworks imply structure, rules, and best practices – everything he despises.",
    "chatId": "698dd112c26bb3cfe26ff7a1"
  }
  ```

- `GET` `ai/history/:id` will send the full chat history
  - Example response body
  ```json
  {
    "_id": "698dd112c26bb3cfe26ff7a1",
    "history": [
      {
        "role": "developer",
        "content": "You are a helpful assistant",
        "_id": "698dd112c26bb3cfe26ff7a2"
      },
      {
        "role": "user",
        "content": "Where should I travel next?",
        "_id": "698dd113c26bb3cfe26ff7a4"
      },
      {
        "role": "assistant",
        "content": "That's an exciting question! To give you the *best* recommendations, I need a little more information about what you're looking for.",
        "_id": "698dd11ac26bb3cfe26ff7a5"
      }
    ],
    "createdAt": "2026-02-12T13:09:38.997Z",
    "updatedAt": "2026-02-12T14:33:36.238Z",
    "__v": 3
  }
  ```
- Updated Zod schema

## Instructions

Use what you know about Express and Mongoose to try and achieve the requirements. If you're feeling stuck, here are some more detailed instructions to get you moving again.

- Install Mongoose and connect to database
- Create a `Chat` Mongoose model with a `history` property that is an array of messages
  - Look in `/controllers/completions.ts` for what properties are needed in each message to be compatible with OpenAI
  - `history` will be an array of [subdocuments](https://mongoosejs.com/docs/subdocs.html)

### `POST` `/ai/chat`

- Make a `createChat` controller, and setup the new `POST` `/ai/chat` endpoint
  - You can start with copying `createInMemoryChat`
- Update your Zod schema to include the optional `chatId` parameter
- Check for an existing chat in the DB, or create a new chat with the `developer` message if none exists
- Instead of pushing to the `messages` array, push new `user` and `assistant` messages to the current chat history
- You will need to serialise the chat history when you pass it to OpenAI (strip it of all of the methods so it's a plain JavaScript Object). One way of doing this is to `stringify` then `parse`
  ```ts
  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || 'gemini-2.5-flash',
    // stringifying and then parsing is like using .lean(). It will turn currentChat into a plain JavaScript Object
    // We don't use .lean(), because we later need to .save()
    messages: JSON.parse(JSON.stringify(currentChat.history))
  });
  ```
- Send the chat completion and the `_id` of the current chat in the response

### `GET` `/ai/history/:id`

- You classic read operation - nothing new here, you know what to do.
