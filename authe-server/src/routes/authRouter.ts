import { Router } from "express";
import {
  login,
  logout,
  me,
  refresh,
  register,
  changePassword,
} from "#controllers";
import { validateBodyZod } from "#middlewares";
import { loginSchema, registerSchema, changePasswordSchema } from "#schemas"; // TODO: use the schemas for validation

const authRouter = Router();

authRouter.post("/register", validateBodyZod(registerSchema), register);

authRouter.post("/login", validateBodyZod(loginSchema), login);

authRouter.post("/refresh", refresh);

authRouter.delete("/logout", logout);

authRouter.get("/me", me);

authRouter.post(
  "/password",
  validateBodyZod(changePasswordSchema),
  changePassword,
);
export default authRouter;
