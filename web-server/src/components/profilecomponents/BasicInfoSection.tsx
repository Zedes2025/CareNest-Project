import { useState } from "react";
import type { FieldErrors, FormState } from "../../profile/myProfileForm";

type Props = {
  form: FormState;
  age: number | null;
  fieldErrors: FieldErrors;
  setField: (path: string, value: string | File) => void;
};

export const BasicInfoSection = ({ form, age, fieldErrors, setField }: Props) => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="form-control">
        <label className="label">
          <span className="label-text">First name</span>
        </label>
        <input className="input input-bordered w-full" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} />
        {fieldErrors.firstName && (
          <label className="label">
            <span className="label-text-alt text-error">{fieldErrors.firstName}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Last name</span>
        </label>
        <input className="input input-bordered w-full" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
        {fieldErrors.lastName && (
          <label className="label">
            <span className="label-text-alt text-error">{fieldErrors.lastName}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Birthday</span>
        </label>
        <input className="input input-bordered w-full" type="date" value={form.birthday} onChange={(e) => setField("birthday", e.target.value)} />
        {fieldErrors.birthday && (
          <label className="label">
            <span className="label-text-alt text-error">{fieldErrors.birthday}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Age</span>
        </label>
        <input className="input input-bordered w-full" value={age === null ? "" : String(age)} readOnly placeholder="-" />
      </div>

      <div className="form-control md:col-span-2">
        <label className="label">
          <span className="label-text">Profile picture</span>
        </label>
        <input
          type="file"
          className="file-input file-input-bordered w-full"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setField("profilePicture", e.target.files[0]);
            }
          }}
        />

        {form.profilePicture ? <img src={form.profilePicture instanceof File ? URL.createObjectURL(form.profilePicture) : form.profilePicture} alt="Profile Preview" className="mt-4 h-32 w-32 rounded-full object-cover" /> : <p className="mt-2 text-sm text-gray-500">No image selected</p>}
      </div>
    </div>
  );
};
