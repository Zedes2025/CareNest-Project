import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { z } from "zod/v4";
import {
  getMyProfileById,
  updateMyProfileById,
  type ApiUserProfile,
} from "../data";
import { useAuth } from "../contexts/AuthContext";

import { DAYS, SLOTS, type Weekday, type SlotKey } from "../constants/schedule";
import { SERVICE_OPTIONS, INTEREST_OPTIONS } from "../constants/profileOptions";

const SLOT_KEY_SET = new Set<string>(SLOTS.map((s) => s.key));

function isSlotKey(value: string): value is SlotKey {
  return SLOT_KEY_SET.has(value);
}

type FormState = {
  firstName: string;
  lastName: string;
  birthday: string; // YYYY-MM-DD
  profilePicture: string;
  aboutMe: string;
  location: {
    street: string;
    houseNumber: string;
    city: string;
    plz: string;
  };
  availability: Record<Weekday, string[]>; // day -> ["morning","midday",...]
  servicesOffered: string[];
  interests: string[];
};

type FieldErrors = Record<string, string>;

const weekdayEnum = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

const dailyScheduleSchema = z.object({
  day: weekdayEnum,
  slots: z.array(z.string()).default([]),
});

const userUpdateSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a valid name"),
  lastName: z.string().trim().min(1, "Enter a valid last name"),
  birthday: z.coerce.date(),
  profilePicture: z.string().default(""),
  aboutMe: z.string().min(10, "Tell us more about you"),
  location: z.object({
    street: z.string().min(3),
    houseNumber: z.string().min(1, "Please enter house number"),
    city: z.string().min(2),
    plz: z.string().regex(/^\d{5}$/, "PLZ must be 5 digits"),
  }),
  availability: z
    .array(dailyScheduleSchema)
    .min(1, "Select at least one availability"),
  servicesOffered: z.array(z.string()).min(1, "Add at least one service"),
  interests: z.array(z.string()).default([]),
});

function issuesToFieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function emptyAvailability(): Record<Weekday, SlotKey[]> {
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

function toDateInputValue(d?: string | Date | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = String(dt.getFullYear());
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ageFromDateInput(birthday: string): number | null {
  // expects YYYY-MM-DD (from <input type="date" />)
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

function profileToForm(p: ApiUserProfile): FormState {
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
    location: {
      street: p.location?.street ?? "",
      houseNumber: p.location?.houseNumber ?? "",
      city: p.location?.city ?? "",
      plz: p.location?.plz ?? "",
    },
    availability: avail,
    servicesOffered: p.servicesOffered ?? [],
    interests: p.interests ?? [],
  };
}

function formToApiBody(f: FormState) {
  const availability = DAYS.map(({ key }) => ({
    day: key,
    slots: f.availability[key] ?? [],
  }));

  return {
    firstName: f.firstName,
    lastName: f.lastName,
    birthday: f.birthday, // z.coerce.date() accepts string
    profilePicture: f.profilePicture,
    aboutMe: f.aboutMe,
    location: f.location,
    availability,
    servicesOffered: f.servicesOffered,
    interests: f.interests,
  };
}

export const MyProfilePage = () => {
  const { signedIn, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    birthday: "",
    profilePicture: "",
    aboutMe: "",
    location: { street: "", houseNumber: "", city: "", plz: "" },
    availability: emptyAvailability(),
    servicesOffered: [],
    interests: [],
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string>("");

  const canSave = useMemo(() => {
    return (
      form.firstName &&
      form.lastName &&
      form.birthday &&
      form.aboutMe &&
      form.location.street &&
      form.location.houseNumber &&
      form.location.city &&
      form.location.plz
    );
  }, [form]);

  const age = useMemo(() => ageFromDateInput(form.birthday), [form.birthday]);

  useEffect(() => {
    if (!signedIn || !user?._id) return;

    const run = async () => {
      setLoading(true);
      setMessage("");
      setFieldErrors({});
      try {
        const profile = await getMyProfileById(user._id);
        setForm(profileToForm(profile));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load profile.";
        setMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [signedIn, user?._id]);

  function setField(path: string, value: any) {
    setForm((prev) => {
      // shallow + known structure updates
      if (path.startsWith("location.")) {
        const k = path.split(".")[1] as keyof FormState["location"];
        return { ...prev, location: { ...prev.location, [k]: value } };
      }
      return { ...prev, [path]: value } as FormState;
    });
    setFieldErrors((prev) => ({ ...prev, [path]: "" }));
    setMessage("");
  }

  function toggleSlot(day: Weekday, slot: SlotKey) {
    setForm((prev) => {
      const curr = prev.availability[day] ?? [];
      const next = curr.includes(slot)
        ? curr.filter((s) => s !== slot)
        : [...curr, slot];
      return { ...prev, availability: { ...prev.availability, [day]: next } };
    });
    setFieldErrors((prev) => ({ ...prev, availability: "" }));
    setMessage("");
  }

  function toggleArrayValue(
    key: "servicesOffered" | "interests",
    value: string,
  ) {
    setForm((prev) => {
      const curr = prev[key];
      const next = curr.includes(value)
        ? curr.filter((x) => x !== value)
        : [...curr, value];
      return { ...prev, [key]: next };
    });
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setMessage("");
  }

  const onSave = async () => {
    if (!user?._id) return;

    setSaving(true);
    setMessage("");
    setFieldErrors({});

    const body = formToApiBody(form);
    const parsed = userUpdateSchema.safeParse(body);

    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error));
      setSaving(false);
      return;
    }

    // optional: enforce at least 1 selected slot in UI (backend doesn’t require it)
    const selectedSlotCount = DAYS.reduce(
      (acc, d) => acc + (form.availability[d.key]?.length ?? 0),
      0,
    );
    if (selectedSlotCount === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        availability: "Select at least one time slot.",
      }));
      setSaving(false);
      return;
    }

    try {
      await updateMyProfileById(user._id, parsed.data);
      setMessage("Profile saved.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save profile.";
      setMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!signedIn) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h1 className="card-title text-2xl">My Profile</h1>
            <p className="opacity-70">
              You need to be logged in to view this page.
            </p>
            <div className="card-actions mt-4">
              <Link to="/login" className="btn btn-primary">
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h1 className="card-title text-2xl">My Profile</h1>

            {message && (
              <div className="alert alert-info mt-2" role="status">
                <span>{message}</span>
              </div>
            )}

            {loading ? (
              <div className="mt-6 flex items-center gap-3">
                <span className="loading loading-ring loading-md" />
                <span className="opacity-70">Loading profile...</span>
              </div>
            ) : (
              <>
                {/* Basic info */}
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">First name</span>
                    </label>
                    <input
                      className="input input-bordered w-full"
                      value={form.firstName}
                      onChange={(e) => setField("firstName", e.target.value)}
                    />
                    {fieldErrors.firstName && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {fieldErrors.firstName}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Last name</span>
                    </label>
                    <input
                      className="input input-bordered w-full"
                      value={form.lastName}
                      onChange={(e) => setField("lastName", e.target.value)}
                    />
                    {fieldErrors.lastName && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {fieldErrors.lastName}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Birthday</span>
                    </label>
                    <input
                      className="input input-bordered w-full"
                      type="date"
                      value={form.birthday}
                      onChange={(e) => setField("birthday", e.target.value)}
                    />
                    {fieldErrors.birthday && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {fieldErrors.birthday}
                        </span>
                      </label>
                    )}
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Age</span>
                    </label>
                    <input
                      className="input input-bordered w-full"
                      value={age === null ? "" : String(age)}
                      readOnly
                      placeholder="-"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Profile picture (URL)</span>
                    </label>
                    <input
                      className="input input-bordered w-full"
                      value={form.profilePicture}
                      onChange={(e) =>
                        setField("profilePicture", e.target.value)
                      }
                      placeholder="https://..."
                    />
                    {fieldErrors.profilePicture && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {fieldErrors.profilePicture}
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* About */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">About me</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered min-h-28 w-full"
                    value={form.aboutMe}
                    onChange={(e) => setField("aboutMe", e.target.value)}
                  />
                  {fieldErrors.aboutMe && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {fieldErrors.aboutMe}
                      </span>
                    </label>
                  )}
                </div>

                {/* Location */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold">Location</h2>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Street</span>
                      </label>
                      <input
                        className="input input-bordered w-full"
                        value={form.location.street}
                        onChange={(e) =>
                          setField("location.street", e.target.value)
                        }
                      />
                      {fieldErrors["location.street"] && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {fieldErrors["location.street"]}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">House nr.</span>
                      </label>
                      <input
                        className="input input-bordered w-full"
                        value={form.location.houseNumber}
                        onChange={(e) =>
                          setField("location.houseNumber", e.target.value)
                        }
                      />
                      {fieldErrors["location.houseNumber"] && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {fieldErrors["location.houseNumber"]}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">City</span>
                      </label>
                      <input
                        className="input input-bordered w-full"
                        value={form.location.city}
                        onChange={(e) =>
                          setField("location.city", e.target.value)
                        }
                      />
                      {fieldErrors["location.city"] && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {fieldErrors["location.city"]}
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Postal code</span>
                      </label>
                      <input
                        className="input input-bordered w-full"
                        value={form.location.plz}
                        onChange={(e) =>
                          setField("location.plz", e.target.value)
                        }
                        placeholder="12345"
                      />
                      {fieldErrors["location.plz"] && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {fieldErrors["location.plz"]}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Availability 7x3 */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold">Times available</h2>
                  {fieldErrors.availability && (
                    <div className="mt-2 text-sm text-error">
                      {fieldErrors.availability}
                    </div>
                  )}

                  <div className="mt-3 overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Day</th>
                          {SLOTS.map((s) => (
                            <th key={s.key}>{s.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map((d) => (
                          <tr key={d.key}>
                            <td className="font-semibold">{d.label}</td>
                            {SLOTS.map((s) => {
                              const active =
                                form.availability[d.key]?.includes(s.key) ??
                                false;
                              return (
                                <td key={s.key}>
                                  <button
                                    type="button"
                                    className={[
                                      "btn",
                                      "btn-sm",
                                      "w-full",
                                      "h-9", // fixe Höhe
                                      "min-h-9", // DaisyUI min-height überschreiben
                                      "border-2", // immer gleiche Border-Dicke (outline/primary)
                                      active ? "btn-primary" : "btn-outline",
                                    ].join(" ")}
                                    onClick={() => toggleSlot(d.key, s.key)}
                                  >
                                    {active ? "Select" : "Select"}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Services */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold">Services offered</h2>
                  {fieldErrors.servicesOffered && (
                    <div className="mt-2 text-sm text-error">
                      {fieldErrors.servicesOffered}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SERVICE_OPTIONS.map((opt) => {
                      const active = form.servicesOffered.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
                          onClick={() =>
                            toggleArrayValue("servicesOffered", opt)
                          }
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interests */}
                <div className="mt-6">
                  <h2 className="text-lg font-semibold">Interests</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((opt) => {
                      const active = form.interests.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
                          onClick={() => toggleArrayValue("interests", opt)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="card-actions mt-8">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={onSave}
                    disabled={!canSave || saving}
                  >
                    {saving ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
