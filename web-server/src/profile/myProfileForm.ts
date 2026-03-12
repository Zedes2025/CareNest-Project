import { z } from "zod/v4";
import { DAYS, SLOTS, type SlotKey, type Weekday } from "./schedule";
import type { ApiUserProfile } from "../data";

export type FormState = {
  firstName: string;
  lastName: string;
  birthday: string; // YYYY-MM-DD
  profilePicture: string | File | null;
  aboutMe: string;
  address: {
    street: string;
    houseNumber: string;
    city: string;
    plz: string;
  };
  availability: Record<Weekday, SlotKey[]>;
  servicesOffered: string[];
  interests: string[];
};

export type FieldErrors = Record<string, string>;

// ---- Slot-Key guard (Backend liefert string[], UI erwartet SlotKey[])
const SLOT_KEY_SET = new Set<string>(SLOTS.map((s) => s.key));
function isSlotKey(value: string): value is SlotKey {
  return SLOT_KEY_SET.has(value);
}

// ---- Zod schema (Frontend-Validation passend zum Backend)
const weekdayEnum = z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);

const dailyScheduleSchema = z.object({
  day: weekdayEnum,
  slots: z.array(z.string()).default([]),
});

export const userUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a valid name"),
  lastName: z.string().trim().min(1, "Enter a valid last name"),
  birthday: z.coerce.date(),
  profilePicture: z.string().trim().default(""),
  aboutMe: z.string().min(10, "Tell us more about you"),
  address: z.object({
    street: z.string().min(3),
    houseNumber: z.string().min(1, "Please enter house number"),
    city: z.string().min(2),
    plz: z.string().regex(/^\d{5}$/, "PLZ must be 5 digits"),
  }),
  availability: z.array(dailyScheduleSchema).min(1, "Select at least one availability"),
  servicesOffered: z.array(z.string()).min(1, "Add at least one service"),
  interests: z.array(z.string()).default([]),
});

export function issuesToFieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function emptyAvailability(): Record<Weekday, SlotKey[]> {
  return {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };
}

export const emptyFormState: FormState = {
  firstName: "",
  lastName: "",
  birthday: "",
  profilePicture: "",
  aboutMe: "",
  address: { street: "", houseNumber: "", city: "", plz: "" },
  availability: emptyAvailability(),
  servicesOffered: [],
  interests: [],
};

export function toDateInputValue(d?: string | Date | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = String(dt.getFullYear());
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function ageFromDateInput(birthday: string): number | null {
  if (!birthday) return null;

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthday);
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const now = new Date();
  const nowY = now.getFullYear();
  const nowM = now.getMonth() + 1;
  const nowD = now.getDate();

  let age = nowY - year;
  const hadBirthdayThisYear = nowM > month || (nowM === month && nowD >= day);
  if (!hadBirthdayThisYear) age -= 1;

  if (age < 0 || age > 130) return null;
  return age;
}

export function profileToForm(p: ApiUserProfile): FormState {
  const avail = emptyAvailability();

  for (const entry of p.availability ?? []) {
    const cleanedSlots = (entry.slots ?? []).filter(isSlotKey);
    avail[entry.day] = cleanedSlots;
  }

  return {
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    birthday: toDateInputValue(p.birthday ?? null),
    profilePicture: p.profilePicture ?? "",
    aboutMe: p.aboutMe ?? "",
    address: {
      street: p.address?.street ?? "",
      houseNumber: p.address?.houseNumber ?? "",
      city: p.address?.city ?? "",
      plz: p.address?.plz ?? "",
    },
    availability: avail,
    servicesOffered: p.servicesOffered ?? [],
    interests: p.interests ?? [],
  };
}

export function formToApiBody(f: FormState) {
  const availability = DAYS.map(({ key }) => ({
    day: key,
    slots: f.availability[key] ?? [],
  }));

  return {
    firstName: f.firstName,
    lastName: f.lastName,
    birthday: f.birthday,
    profilePicture: typeof f.profilePicture === "string" ? f.profilePicture : undefined,
    aboutMe: f.aboutMe,
    address: {
      street: f.address?.street ?? "",
      houseNumber: f.address?.houseNumber ?? "",
      city: f.address?.city ?? "",
      plz: f.address?.plz ?? "",
    },
    availability,
    servicesOffered: f.servicesOffered,
    interests: f.interests,
  };
}

export function countSelectedSlots(f: FormState): number {
  return DAYS.reduce((acc, d) => acc + (f.availability[d.key]?.length ?? 0), 0);
}
