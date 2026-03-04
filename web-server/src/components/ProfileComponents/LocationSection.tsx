import type { FieldErrors, FormState } from "../../profile/myProfileForm";

type Props = {
  form: FormState;
  fieldErrors: FieldErrors;
  setField: (path: string, value: string) => void;
};

export const LocationSection = ({ form, fieldErrors, setField }: Props) => {
  return (
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
            onChange={(e) => setField("location.street", e.target.value)}
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
            onChange={(e) => setField("location.houseNumber", e.target.value)}
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
            onChange={(e) => setField("location.city", e.target.value)}
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
            onChange={(e) => setField("location.plz", e.target.value)}
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
  );
};
