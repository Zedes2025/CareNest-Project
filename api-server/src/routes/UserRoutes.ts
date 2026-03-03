import { Router } from "express";
import { validateBody, authenticate } from "#middlewares";
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
  .post(authenticate, validateBody(userCreateSchema), createUser);
userRoutes
  .route("/profile/:id")
  .get(authenticate, getMyProfileById)
  .put(authenticate, validateBody(userUpdateSchema), updateUserProfile)
  .delete(authenticate, deleteUser);

userRoutes.route("/all").get(getAllUsers);
userRoutes.route("/:id").get(getOtherUserById);

export default userRoutes;
