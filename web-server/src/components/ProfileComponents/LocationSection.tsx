import type { FieldErrors, FormState } from "../../profile/myProfileForm";

type Props = {
  form: FormState;
  fieldErrors: FieldErrors;
  setField: (path: string, value: string) => void;
};

export const LocationSection = ({ form, fieldErrors, setField }: Props) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">Address</h2>

      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Street</span>
          </label>
          <input className="input input-bordered w-full" value={form.address.street} onChange={(e) => setField("address.street", e.target.value)} />
          {fieldErrors["address.street"] && (
            <label className="label">
              <span className="label-text-alt text-error">{fieldErrors["address.street"]}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">House nr.</span>
          </label>
          <input className="input input-bordered w-full" value={form.address.houseNumber} onChange={(e) => setField("address.houseNumber", e.target.value)} />
          {fieldErrors["address.houseNumber"] && (
            <label className="label">
              <span className="label-text-alt text-error">{fieldErrors["address.houseNumber"]}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">City</span>
          </label>
          <input className="input input-bordered w-full" value={form.address.city} onChange={(e) => setField("address.city", e.target.value)} />
          {fieldErrors["address.city"] && (
            <label className="label">
              <span className="label-text-alt text-error">{fieldErrors["address.city"]}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Postal code</span>
          </label>
          <input className="input input-bordered w-full" value={form.address.plz} onChange={(e) => setField("address.plz", e.target.value)} placeholder="12345" />
          {fieldErrors["address.plz"] && (
            <label className="label">
              <span className="label-text-alt text-error">{fieldErrors["address.plz"]}</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
