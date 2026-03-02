import { Router } from "express";
import { validateBody } from "#middlewares";
import { z } from "zod";

import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUserProfile,
} from "#controllers";

import { userCreateSchema, userUpdateSchema } from "#schemas";

const userRoutes = Router();

userRoutes
  .route("/")
  .get(getUsers)
  .post(validateBody(userCreateSchema), createUser);
userRoutes
  .route("/:id")
  .get(getUserById)
  .put(validateBody(userUpdateSchema), updateUserProfile)
  .delete(deleteUser);

export default userRoutes;
