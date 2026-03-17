import { Schema, model } from "mongoose";

const msgContactSchema = new Schema({
  fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  msg: { type: String, required: true, minLength: 1, trim: true },
  createdAt: { type: Date, default: Date.now },
});

msgContactSchema.index({ fromUserId: 1, toUserId: 1, createdAt: -1 });
// here -1 says it shows us the recent created req first.

export default model("msgContact", msgContactSchema);
