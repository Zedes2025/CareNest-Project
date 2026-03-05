import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import RegisterForm from "../components/ui/RegisterForm";
import type { LoginProps } from "../types";

export default function RegisterPage({ error }: LoginProps) {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(error || "");

  const onSubmit = async (data: RegisterFormState) => {
    try {
      setLoading(true);
      setFormError("");

      // 1. Call the registration logic from your Auth Context
      await handleRegister(data);

      // 2. If successful, send them to the Login page
      navigate("/my-profile");
    } catch (error) {
      // 3. Catch any errors (User already exists, Network error, etc.)
      setFormError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      // 4. Always turn off the loading spinner
      setLoading(false);
    }
  };

  return <RegisterForm error={formError} loading={loading} onSubmit={onSubmit} />;
}
