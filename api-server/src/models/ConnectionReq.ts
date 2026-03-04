import { Schema, model } from "mongoose";

const connectionReqSchema = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, minLength: 10, trim: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true },
);
// 1. Speeds up the "Inbox" view
connectionReqSchema.index({ toUserId: 1, status: 1 });
// 2. Prevents duplicate requests
connectionReqSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

export default model("ConnectionReq", connectionReqSchema);
