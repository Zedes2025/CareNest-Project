import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import LoginForm from "../components/ui/LoginForm";
import type { LoginProps } from "../types";

export default function LoginPage({ error }: LoginProps) {
  const { handleSignIn, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(error || "");

  // Redirect if already authenticated,
  // replace-(Replaces current history entry;usecase-Redirects, login flows, preventing back navigation)checkpoint where the authenticated user when navigates with back and forward button in browser(it doesnt navigate to /login , even when u manually type in), it doesnt go to browser history, rather it stays in homepage
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setLoading(true);
      setFormError("");
      await handleSignIn(data);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm loading={loading} onSubmit={onSubmit} error={formError} />;
}
