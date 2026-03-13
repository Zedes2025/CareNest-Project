import { Schema, model } from "mongoose";

const connectionReqSchema = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // message: { type: String, required: true, minLength: 10, trim: true },
    // profilePicture: { type: String, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  },
  { timestamps: true },
);
// It kind of holds everything in ascending order as status,toUserId is 1 , and makes the search easy when we do it in controller.
connectionReqSchema.index({ toUserId: 1, status: 1 });
// Prevents duplicate requests
connectionReqSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

export default model("ConnectionReq", connectionReqSchema);
