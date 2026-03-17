import { z } from "zod";

const emailError = "Please provide a valid email address.";
const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please provide a valid email address." });

const basePasswordSchema = z
  .string({ error: "Password must be a string" })
  .min(6, { error: "Password must be at least 6 characters." })
  .max(30, { error: "The length of this Password is excessive." });

export const registerSchema = z
  .object(
    {
      firstName: z
        .string()
        .min(2, "Name too short")
        .regex(/[a-zA-Z]/, "Letters only"),
      lastName: z
        .string()
        .min(2, "Name too short")
        .regex(/[a-zA-Z]/, "Letters only"),
      email: emailSchema,
      password: basePasswordSchema
        .regex(/[a-z]/, {
          error: "Password must include at least one lowercase letter.",
        })
        .regex(/[A-Z]/, {
          error: "Password must include at least one uppercase letter.",
        })
        .regex(/[0-9]/, { error: "Password must include at least one number." })
        .regex(/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>/?`~]/, {
          error: "Password must include at least one special character",
        }),
      confirmPassword: z.string(),
    },
    { error: "Please provide a valid email and a secure password." },
  )

  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // to set the error at that field
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: basePasswordSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

const passwordSchema = registerSchema.shape.password; // reuses the password validation from the register schema

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  })
  .strict();
