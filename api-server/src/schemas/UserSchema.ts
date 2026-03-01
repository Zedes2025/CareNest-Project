import { z } from "zod";

// reusable enums
const weekdayEnum = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// DailySchedule schema
const dailyScheduleSchema = z.object({
  day: weekdayEnum,
  slots: z.array(z.string()).default([]),
});

// Main User schema
export const userSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a valid name"),
  lastName: z.string().trim().min(1, "Enter a valid last name"),

  email: z.email("Enter a valid email").trim().toLowerCase(),

  password: z.string().min(8, "Password must be at least 8 characters long"),
  birthday: z.coerce.date(),

  profilePicture: z.string().default(""),
  Age: z.number().optional(),

  aboutMe: z.string().min(10, "Tell us more about you"),
  location: z.object({
    street: z.string().min(3),
    houseNumber: z.string().min(1, "Please enter house number"),
    city: z.string().min(2),
    plz: z.string().regex(/^\d{5}$/, "PLZ must be 5 digits"),
  }),
  availableTime: z.array(weekdayEnum).min(1, "Select at least one day"),

  availability: z
    .array(dailyScheduleSchema)
    .min(1, "Select at least one availability"),

  servicesOffered: z.array(z.string()).min(1, "Add at least one service"),

  interests: z.array(z.string()).default([]),
});
