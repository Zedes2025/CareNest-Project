export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type TimeSlot = string; // flexible for now, e.g., "morning", "noon", "afternoon"

export interface DailySchedule {
  day: Weekday;
  slots: TimeSlot[];
}
