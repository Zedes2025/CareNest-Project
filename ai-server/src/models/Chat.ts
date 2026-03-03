import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['assistant', 'system', 'user', 'developer'],
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const chatSchema = new Schema({
  history: { type: [messageSchema], default: [] }
});

export default model('Chat', chatSchema);
