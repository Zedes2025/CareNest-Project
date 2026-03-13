import { Schema, model } from 'mongoose';

const docSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    fileName: {
      type: String,
      required: true
    },
    summary: {
      type: String
    }
  },
  { timestamps: true }
);

export default model('Doc', docSchema);
