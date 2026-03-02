import { useMemo, useState } from "react";
import { Link } from "react-router";
import { loginSchema, type LoginInput } from "../../lib/authSchemas";
import type { SubmitEventHandler } from "react";
import * as z from "zod";

//For error message
type FieldErrors = Partial<Record<keyof LoginInput, string>>;

//Form Data Box
export const LoginPage = () => {
  const [values, setValues] = useState<LoginInput>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string>("");

  const canSubmit = useMemo(
    () => values.email.length > 0 && values.password.length > 0,
    [values],
  );

  //Makesure all fields are filled out
  function onChange<K extends keyof LoginInput>(key: K, v: LoginInput[K]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    setFormMessage("");
  }

  //Clear old Status Message and show new error or success cleanly
  const onSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setFormMessage("");

    //run zod validation against current form values
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const fe = z.flattenError(parsed.error).fieldErrors;

      setFieldErrors({
        email: fe.email?.[0],
        password: fe.password?.[0],
      });

      return;
    }

    // Frontend-only placeholder (no auth, no API)
    setFormMessage("Login form submitted (placeholder).");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h1 className="card-title text-2xl">Login</h1>

            {formMessage && (
              <div className="alert alert-info mt-2" role="status">
                <span>{formMessage}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
                  autoComplete="current-password"
                />
                {fieldErrors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {fieldErrors.password}
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
                  Sign in
                </button>
              </div>
            </form>

            <div className="mt-6">
              <Link to="/register" className="btn btn-outline w-full">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
