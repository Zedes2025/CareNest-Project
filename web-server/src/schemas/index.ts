import { z } from "zod/v4";

const emailError = "Please provide a valid email address.";
const emailSchema = z.string({ error: emailError }).trim().email({ error: emailError });

const basePasswordSchema = z.string({ error: "Password must be a string" }).min(6, { error: "Password must be at least 6 characters." }).max(30, { error: "The length of this Password is excessive." });

export const registerSchema = z
  .strictObject(
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
        .regex(/[a-z]/, { error: "Password must include at least one lowercase letter." })
        .regex(/[A-Z]/, { error: "Password must include at least one uppercase letter." })
        .regex(/[0-9]/, { error: "Password must include at least one number." })
        .regex(/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>/?`~]/, {
          error: "Password must include at least one special character",
        }),
      confirmPassword: z.string(),
    },
    { error: "Please provide a valid email and a secure password." },
  )

  .refine((data) => data.password === data.confirmPassword, { error: "Passwords don't match" });
