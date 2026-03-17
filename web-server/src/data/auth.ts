import { authServiceURL } from "../utils/index";

type SuccessRes = { message: string };
type TokenRes = SuccessRes & { accessToken: string; refreshToken: string };

const login = async (formData: LoginInput): Promise<TokenRes> => {
  const res = await fetch(`${authServiceURL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    // 1. Get the actual error JSON from your backend/Zod
    const errorData = await res.json();

    // Throw the specific error message
    throw new Error(errorData.message || "Login failed");
  }

  const data = (await res.json()) as TokenRes;

  return data;
};

const me = async (): Promise<User> => {
  const accessToken = localStorage.getItem("accessToken");

  const res = await fetch(`${authServiceURL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    // 1. Get the actual error JSON from your backend/Zod
    const errorData = await res.json();

    // Throw the specific error message
    throw new Error(errorData.message || "Authentication failed");
  }
  const { user } = (await res.json()) as SuccessRes & { user: User };

  return user;
};
const logout = async (): Promise<SuccessRes> => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const res = await fetch(`${authServiceURL}/logout`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    // 1. Get the actual error JSON from your backend/Zod
    const errorData = await res.json();

    // Throw the specific error message
    throw new Error(errorData.message || "Logout failed");
  }
  const data = (await res.json()) as SuccessRes;

  return data;
};

const register = async (formData: RegisterFormState): Promise<TokenRes> => {
  const res = await fetch(`${authServiceURL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    // 1. Get the actual error JSON from your backend/Zod
    const errorData = await res.json();
    console.log("SERVER ERROR DATA:", errorData); // DEBUG THIS

    // Throw the specific error message
    throw new Error(errorData.message || "Registration failed");
  }

  const data = (await res.json()) as TokenRes;

  return data;
};

export { login, me, logout, register };
