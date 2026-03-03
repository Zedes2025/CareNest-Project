import { Link } from "react-router";
import { registerSchema } from "../../schemas";
import { useMemo, useState } from "react";
import { z } from "zod";

interface RegisterFormProps extends RegisterFormState {
  fieldErrors: Partial<Record<keyof RegisterFormState, string>>;
  onChange: (field: RegisterFormState, value: string) => void;
  onSubmit: (data: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string }) => void;
}
//For error message
type FieldErrors = Partial<Record<keyof RegisterFormState, string>>;

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
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
    return values.firstName.length > 0 && values.lastName.length > 0 && values.email.length > 0 && values.password.length > 0 && values.confirmPassword.length > 0;
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
    setFieldErrors({}); // Clear previous errors
    setFormMessage("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // 1. Validate with Zod
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      const fe = z.flattenError(result.error).fieldErrors;

      setFieldErrors({
        firstName: fe.firstName?.[0],
        lastName: fe.lastName?.[0],
        email: fe.email?.[0],
        password: fe.password?.[0],
        confirmPassword: fe.confirmPassword?.[0],
      });
      return;
    }

    // 3. If valid, send the validated data for Authentication
    onSubmit(result.data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title justify-center text-2xl">Register</h1>
            {formMessage && (
              <div className="alert alert-info mt-2" role="status">
                <span>{formMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* //first Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First name</span>
                </label>
                <input name="firstName" type="text" className="input input-bordered w-full" value={values.firstName} onChange={onChange} autoComplete="given-name" />
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
                <input name="lastName" type="text" className="input input-bordered w-full" value={values.lastName} onChange={onChange} autoComplete="given-name" />
                {fieldErrors.lastName && (
                  <label className="label">
                    <span className="label-text-alt text-error">{fieldErrors.lastName}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input name="email" type="email" className="input input-bordered w-full" value={values.email} onChange={onChange} autoComplete="email" />
                {fieldErrors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{fieldErrors.email}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input name="password" type="password" className="input input-bordered w-full" value={values.password} onChange={onChange} autoComplete="new-password" />
                {fieldErrors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">{fieldErrors.password}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm password</span>
                </label>
                <input name="confirmPassword" type="password" className="input input-bordered w-full" value={values.confirmPassword} onChange={onChange} autoComplete="new-password" />
                {fieldErrors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{fieldErrors.confirmPassword}</span>
                  </label>
                )}
              </div>

              <div className="card-actions mt-2">
                <button className="btn btn-primary w-full" type="submit" disabled={!canSubmit}>
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
}

// export default function RegisterForm({ error, loading, onSubmit }: RegisterFormProps) {
//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const formData = new FormData(e.currentTarget);

//     // validation

//     //zod cannot parse the formData object, so we can convert it with the below line
//     const data = Object.fromEntries(formData.entries());
//     const result = registerSchema.safeParse(data);

//     if (!result.success) {
//       // result.error contains all your validation messages formatted for TS
//       console.log(result.error.format());
//       return;
//     }
//     const firstName = formData.get("firstName") as string;
//     const lastName = formData.get("lastName") as string;
//     const email = formData.get("email") as string;
//     const confirmPassword = formData.get("confirmPassword") as string;
//     const password = formData.get("password") as string;

//     onSubmit({ firstName, lastName, email, password, confirmPassword });
//   };
//   return (
//     <div className="container mx-auto px-4 py-10">
//       <div className="mx-auto w-full max-w-md">
//         <div className="card bg-base-100 shadow">
//           <div className="card-body">
//             <h1 className="card-title  justify-center text-2xl">Register</h1>
//             <form onSubmit={handleSubmit} className="mt-4 space-y-4">
//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text">First name</span>
//                 </label>
//                 <input name="firstName" type="text" className="input input-bordered w-full" autoComplete="given-name" required />
//               </div>

//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text">Last name</span>
//                 </label>
//                 <input name="lastName" type="text" className="input input-bordered w-full" autoComplete="family-name" required />
//               </div>

//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text">Email</span>
//                 </label>
//                 <input name="email" type="email" className="input input-bordered w-full" autoComplete="email" required />
//               </div>

//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text">Password</span>
//                 </label>
//                 <input name="password" type="password" className="input input-bordered w-full" autoComplete="new-password" required />
//               </div>

//               <div className="form-control">
//                 <label className="label">
//                   <span className="label-text">Confirm password</span>
//                 </label>
//                 <input name="confirmPassword" type="password" className="input input-bordered w-full" autoComplete="new-password" required />
//               </div>

//               <div className="card-actions mt-2">
//                 <button className="btn btn-primary mt-6 text-base h-12 w-full" disabled={loading}>
//                   {loading ? "Registering..." : "Register"}
//                 </button>
//                 {error && <p className="text-red-600 mt-2">{error}</p>}
//                 <p className="text-center mt-4">
//                   Already have an account?
//                   <Link to="/login" className="text-blue-600 hover:underline ml-1">
//                     Login
//                   </Link>
//                 </p>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
