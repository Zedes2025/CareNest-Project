import type { LoginProps } from "../../types";
import { Link } from "react-router";
import bg from "../../assets/auth-bg.jpg";

interface LoginFormProps extends LoginProps {
  loading: boolean;
  onSubmit: (data: { email: string; password: string }) => void;
}

export default function LoginForm({
  loading,
  onSubmit,
  error,
}: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    onSubmit({ email, password });
  };
  return (
    <div
      className="flex flex-1 min-h-screen items-center justify-center px-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-full max-w-md">
        <div className="card bg-base-100/85 backdrop-blur shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl justify-center mb-4">Login</h1>
            <form
              onSubmit={handleSubmit}
              className="card p-6 shadow-xl bg-base-200"
            >
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="input input-bordered w-full mb-4"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="input input-bordered w-full mb-4"
                required
              />

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Sign In"
                )}
              </button>

              {error && <p className="text-error mt-2">{error}</p>}
              <p className="text-center mt-4">
                Don't have an account?
                <Link
                  to="/register"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
