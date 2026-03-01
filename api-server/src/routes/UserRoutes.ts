import { Router } from "express";
import { validateBody } from "#middlewares";
import { z } from "zod";

import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
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
  .put(validateBody(userUpdateSchema), updateUser)
  .delete(deleteUser);

export default userRoutes;
