import { Router } from "express";
import { validateBody } from "#middlewares";
import { z } from "zod";

import {
  getUsers,
  createUser,
  deleteUser,
  getMyProfileById,
  getAllUsers,
  getOtherUserById,
  updateUserProfile,
} from "#controllers";

import { userCreateSchema, userUpdateSchema } from "#schemas";

const userRoutes = Router();

userRoutes
  .route("/register")
  .get(getUsers) // just for postman testing, can be removed later
  .post(validateBody(userCreateSchema), createUser);
userRoutes
  .route("/profile/:id")
  .get(getMyProfileById)
  .put(validateBody(userUpdateSchema), updateUserProfile)
  .delete(deleteUser);

userRoutes.route("/all").get(getAllUsers);
userRoutes.route("/:id").get(getOtherUserById);

export default userRoutes;
