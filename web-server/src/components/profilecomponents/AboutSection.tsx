import type { FieldErrors, FormState } from "../../profile/myProfileForm";

type Props = {
  form: FormState;
  fieldErrors: FieldErrors;
  setField: (path: string, value: string) => void;
};

export const AboutSection = ({ form, fieldErrors, setField }: Props) => {
  return (
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
  );
};
