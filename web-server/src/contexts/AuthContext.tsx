import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { login, logout, me, register } from "../data";

interface AuthContextType {
  signedIn: boolean;
  user: User | null;
  loading: boolean;
  handleSignIn: (input: LoginInput) => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleRegister: (formData: RegisterFormState) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkSession, setCheckSession] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await me();
        setUser(userData);
        setSignedIn(true);
      } catch (error) {
        console.error(error);
      } finally {
        setCheckSession(false);
      }
    };

    if (checkSession) getUser();
  }, [checkSession]);

  const handleSignIn = async ({ email, password }: LoginInput) => {
    const { accessToken, refreshToken } = await login({ email, password });
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setSignedIn(true);
    setCheckSession(true);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      setSignedIn(false);
      setUser(null);
      setCheckSession(false);
    }
  };

  const handleRegister = async (formData: RegisterFormState) => {
    const { accessToken, refreshToken } = await register(formData);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setSignedIn(true);
    setCheckSession(true);
  };

  return (
    <AuthContext.Provider
      value={{
        signedIn,
        user,
        loading: checkSession,
        handleSignIn,
        handleSignOut,
        handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  //--- specify return type
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
