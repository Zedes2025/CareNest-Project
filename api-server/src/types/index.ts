export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type TimeSlot = string; // flexible for now, e.g., "morning", "noon", "afternoon"

export interface DailySchedule {
  day: Weekday;
  slots: TimeSlot[];
}

type UserType = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  birthday: Date;
  profilePicture: string;
  Age?: number;
  //Age?: { type: Number };

  aboutMe: string;

  address: Record<string, any>;
  // availableTime: Weekday[];
  availability: DailySchedule[];
  servicesOffered: string[];
  interests: string[];

  createdAt: Date;
  updatedAt: Date;
};

// Message type
interface Message {
  role: "assistant" | "system" | "user" | "developer";
  content: string;
  createdAt: Date;
}

// Chat type
interface AIConversationType {
  _id?: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
}

export type { UserType, AIConversationType };
