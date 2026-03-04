import { Schema, model } from "mongoose";
import type { DailySchedule } from "#types";

const DailyScheduleSchema = new Schema<DailySchedule>(
  {
    day: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      required: true,
    },
    slots: { type: [String], default: [] }, // flexible slots like "morning", "noon", etc.
  },
  { _id: false }, // embedded schema does not need its own _id
);
// Main user schema
const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    //birthday: { type: Date, default: null },
    //profilePicture: { type: String, default: null },
    //age: { type: Number, default: null },
    //aboutMe: { type: String, default: null },
    //location: { type: String, default: null },
    // availableTime: {
    //   type: [String],
    //   enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    //   default: [],
    // },
    //availability: { type: [DailyScheduleSchema], default: [] },
    //servicesOffered: { type: [String], default: [] },
    // interests: { type: [String], default: [] },
  },
  { timestamps: true },
);
export default model("User", userSchema);
