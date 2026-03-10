import { Schema, model } from "mongoose";
import type { Weekday, TimeSlot, DailySchedule } from "../types";

const DailyScheduleSchema = new Schema<DailySchedule>(
  {
    day: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: true,
    },
    slots: { type: [String], default: [] }, // flexible slots like "morning", "noon", etc.
  },
  { _id: false }, // embedded schema does not need its own _id
);

// Main user schema
const adressSchema = new Schema(
  {
    street: { type: String, required: true },
    houseNumber: { type: String, required: true },
    city: { type: String, required: true },
    plz: { type: String, required: true },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
  },
  { _id: false },
);
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
    password: { type: String, required: true, select: false },

    birthday: { type: Date, required: false },
    profilePicture: { type: String, default: "" },
    // Age: { type: Number },

    aboutMe: { type: String, default: "" },
    address: { type: adressSchema, required: false },

    // availableTime: {
    //   type: [String],
    //   enum: [
    //     "monday",
    //     "tuesday",
    //     "wednesday",
    //     "thursday",
    //     "friday",
    //     "saturday",
    //     "sunday",
    //   ],
    //   default: [],
    // },

    availability: { type: [DailyScheduleSchema], default: [] },

    servicesOffered: { type: [String], default: [] },
    interests: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default model("User", userSchema);
