import type { FieldErrors, FormState } from "../profile/myProfileForm";

type Props = {
  form: FormState;
  age: number | null;
  fieldErrors: FieldErrors;
  setField: (path: string, value: string) => void;
};

export const BasicInfoSection = ({
  form,
  age,
  fieldErrors,
  setField,
}: Props) => {
  return (
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

      <div className="form-control md:col-span-2">
        <label className="label">
          <span className="label-text">Profile picture (URL)</span>
        </label>
        <input
          className="input input-bordered w-full"
          value={form.profilePicture}
          onChange={(e) => setField("profilePicture", e.target.value)}
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
  );
};
