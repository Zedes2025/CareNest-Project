import { Link } from "react-router";
import { registerSchema } from "../../schemas";
import { useMemo, useState } from "react";
import bg from "../../assets/auth-bg.jpg";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormState) => void;
  loading?: boolean;
  error?: string;
}
//For error message
type FieldErrors = Partial<Record<keyof RegisterFormState, string>>; // Record is to store dictionary data type with key and value.

export default function RegisterForm({
  onSubmit,
  loading = false,
  error = "",
}: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormState>({
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

  //No more error message when user corrects input, onChange is a function that is used to handle dynamic field inputs
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Update the new edited  value
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear errors for this field specifically
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    // Clear general message
    setFormMessage("");
  };

  // State to hold specific field errors (e.g., "Password too short")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setFieldErrors({}); // Clear previous errors
    setFormMessage("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // 1. Validate with Zod
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      console.log(result.error.issues);
      const errors: Record<string, string> = {};
      // result.error.issues contains ALL errors, including refinements
      result.error.issues.forEach((issue) => {
        // If the error has a path (like ["confirmPassword"]), use it
        if (issue.path.length > 0) {
          const fieldName = issue.path[0] as string;
          errors[fieldName] = issue.message;
        } else {
          // If it's a general form error, you can show it as a global message
          setFormMessage(issue.message);
        }
      });

      setFieldErrors(errors);
      return;
    }

    // 3. If valid, send the validated data for Authentication
    onSubmit(result.data);
  };

  return (
    <div
      className="flex flex-1 min-h-screen items-center justify-center px-4 py-10 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-md">
        <div className="card bg-base-100/85 backdrop-blur shadow-xl">
          <div className="card-body">
            <h1 className="card-title justify-center text-2xl">Register</h1>
            {formMessage && (
              <div className="alert alert-info mt-2" role="status">
                <span>{formMessage}</span>
              </div>
            )}
            {error && (
              <div className="alert alert-error mt-2" role="alert">
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* //first Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First name</span>
                </label>
                <input
                  name="firstName"
                  type="text"
                  className="input input-bordered w-full"
                  value={values.firstName}
                  onChange={onChange}
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
                  onChange={onChange}
                  autoComplete="given-name"
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
                  onChange={onChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
                  disabled={!canSubmit || loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    "Create account"
                  )}
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
}
