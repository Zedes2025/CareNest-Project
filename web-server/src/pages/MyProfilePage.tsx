import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import {
  getMyProfileById,
  updateMyProfileById,
  type ApiUserProfile,
} from "../data";
import { useAuth } from "../contexts/AuthContext";

import { SERVICE_OPTIONS, INTEREST_OPTIONS } from "../profile/profileOptions";
import { type SlotKey, type Weekday } from "../profile/schedule";

import {
  ageFromDateInput,
  countSelectedSlots,
  emptyFormState,
  formToApiBody,
  issuesToFieldErrors,
  profileToForm,
  type FieldErrors,
  type FormState,
  userUpdateSchema,
} from "../profile/myProfileForm";

import { BasicInfoSection } from "../components/profilecomponents/BasicInfoSection";
import { AboutSection } from "../components/profilecomponents/AboutSection";
import { LocationSection } from "../components/profilecomponents/LocationSection";
import { AvailabilitySection } from "../components/profilecomponents/AvailabilitySection";
import { MultiSelectChips } from "../components/profilecomponents/MultiSelectChips";

import { ProfileDetailCard } from "../components/ui/ProfileDetailCard";

type Mode = "view" | "edit";

export const MyProfilePage = () => {
  const { signedIn, user } = useAuth();

  const [mode, setMode] = useState<Mode>("view");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ApiUserProfile | null>(null);

  const [form, setForm] = useState<FormState>(emptyFormState);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string>("");

  const canSave = useMemo(() => {
    return (
      form.firstName &&
      form.lastName &&
      form.birthday &&
      form.aboutMe &&
      form.address.street &&
      form.address.houseNumber &&
      form.address.city &&
      form.address.plz
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
        const p = await getMyProfileById(user._id);
        setProfile(p);
        setForm(profileToForm(p));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load profile.";
        setMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [signedIn, user?._id]);

  function setField(path: string, value: string) {
    setForm((prev) => {
      if (path.startsWith("address.")) {
        const k = path.split(".")[1] as keyof FormState["address"];
        return { ...prev, address: { ...prev.address, [k]: value } };
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

    if (countSelectedSlots(form) === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        availability: "Select at least one time slot.",
      }));
      setSaving(false);
      return;
    }

    try {
      const updated = await updateMyProfileById(user._id, parsed.data);
      setProfile(updated);
      setForm(profileToForm(updated));
      setMessage("Profile saved.");
      setMode("view");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save profile.";
      setMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const onCancelEdit = () => {
    if (profile) setForm(profileToForm(profile));
    setFieldErrors({});
    setMessage("");
    setMode("view");
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
        {message && (
          <div className="alert alert-info mb-6" role="status">
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <span className="loading loading-ring loading-md" />
                <span className="opacity-70">Loading profile...</span>
              </div>
            </div>
          </div>
        ) : mode === "view" ? (
          profile ? (
            <>
              {!canSave && (
                <div className="alert alert-warning mb-6" role="alert">
                  <span>
                    Your profile looks incomplete. Click “Edit” to finish it.
                  </span>
                </div>
              )}

              <ProfileDetailCard user={profile}>
                <Link to="/home" className="btn btn-outline">
                  Back
                </Link>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setMode("edit")}
                >
                  Edit
                </button>
              </ProfileDetailCard>
            </>
          ) : (
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h1 className="card-title text-2xl">My Profile</h1>
                <p className="opacity-70">Profile could not be loaded.</p>
                <div className="card-actions mt-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setMode("edit")}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h1 className="card-title text-2xl">Edit Profile</h1>

              <BasicInfoSection
                form={form}
                age={age}
                fieldErrors={fieldErrors}
                setField={setField}
              />
              <AboutSection
                form={form}
                fieldErrors={fieldErrors}
                setField={setField}
              />
              <LocationSection
                form={form}
                fieldErrors={fieldErrors}
                setField={setField}
              />

              <AvailabilitySection
                availability={form.availability}
                error={fieldErrors.availability}
                toggleSlot={toggleSlot}
              />

              <MultiSelectChips
                title="Services offered"
                options={SERVICE_OPTIONS}
                selected={form.servicesOffered}
                error={fieldErrors.servicesOffered}
                onToggle={(v) => toggleArrayValue("servicesOffered", v)}
              />

              <MultiSelectChips
                title="Interests"
                options={INTEREST_OPTIONS}
                selected={form.interests}
                onToggle={(v) => toggleArrayValue("interests", v)}
              />

              <div className="card-actions mt-8 justify-between">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={onSave}
                  disabled={!canSave || saving}
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
