import { useMemo, useState } from "react";
import { Link } from "react-router";
import { registerSchema, type RegisterInput } from "../../lib/authSchemas";
import type { SubmitEventHandler } from "react";
import * as z from "zod";

//For error message
type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

//Form Data Box
export const RegistrationPage = () => {
  const [values, setValues] = useState<RegisterInput>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({}); //Field errors for specific field they belong to
  const [formMessage, setFormMessage] = useState<string>(""); //Form Message for general Feedback

  //Makesure all fields are filled out
  const canSubmit = useMemo(() => {
    return (
      values.firstName.length > 0 &&
      values.lastName.length > 0 &&
      values.email.length > 0 &&
      values.password.length > 0 &&
      values.confirmPassword.length > 0
    );
  }, [values]);

  //No more error message when user corrects input
  function onChange<K extends keyof RegisterInput>(
    key: K,
    v: RegisterInput[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setFormMessage("");
  }

  //Clear old Status Message and show new error or success cleanly
  const onSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setFormMessage("");

    //run zod validation against current form values
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const fe = z.flattenError(parsed.error).fieldErrors;

      setFieldErrors({
        firstName: fe.firstName?.[0],
        lastName: fe.lastName?.[0],
        email: fe.email?.[0],
        password: fe.password?.[0],
        confirmPassword: fe.confirmPassword?.[0],
      });

      return;
    }

    // Frontend-only placeholder (no auth, no API)
    setFormMessage("Registration form submitted (placeholder).");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h1 className="card-title text-2xl">Register</h1>

            {formMessage && (
              <div className="alert alert-info mt-2" role="status">
                <span>{formMessage}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First name</span>
                </label>
                <input
                  name="firstName"
                  type="text"
                  className="input input-bordered w-full"
                  value={values.firstName}
                  onChange={(e) => onChange("firstName", e.target.value)}
                  autoComplete="given-name"
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
                  name="lastName"
                  type="text"
                  className="input input-bordered w-full"
                  value={values.lastName}
                  onChange={(e) => onChange("lastName", e.target.value)}
                  autoComplete="family-name"
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
                  <span className="label-text">Email</span>
                </label>
                <input
                  name="email"
                  type="email"
                  className="input input-bordered w-full"
                  value={values.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {fieldErrors.email}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  name="password"
                  type="password"
                  className="input input-bordered w-full"
                  value={values.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  autoComplete="new-password"
                />
                {fieldErrors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {fieldErrors.password}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm password</span>
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="input input-bordered w-full"
                  value={values.confirmPassword}
                  onChange={(e) => onChange("confirmPassword", e.target.value)}
                  autoComplete="new-password"
                />
                {fieldErrors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {fieldErrors.confirmPassword}
                    </span>
                  </label>
                )}
              </div>

              <div className="card-actions mt-2">
                <button
                  className="btn btn-primary w-full"
                  type="submit"
                  disabled={!canSubmit}
                >
                  Create account
                </button>
              </div>
            </form>

            <div className="mt-6">
              <Link to="/login" className="btn btn-outline w-full">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
