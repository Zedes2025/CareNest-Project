import { Router } from "express";
import { validateBodyZod, authenticate, formidableUpload } from "#middlewares";

import {
  getUsers,
  //createUser,
  deleteUser,
  getMyProfileById,
  getAllUsers,
  getOtherUserById,
  updateUserProfile,
  updateProfilePicture,
} from "#controllers";

import { userCreateSchema, userUpdateSchema } from "#schemas";

const userRoutes = Router();

userRoutes.route("/register").get(getUsers); // just for postman testing, can be removed later
//.post(authenticate, validateBody(userCreateSchema), createUser);
userRoutes.route("/profile/:id").get(authenticate, getMyProfileById).put(authenticate, validateBodyZod(userUpdateSchema), updateUserProfile).delete(authenticate, deleteUser);
// route for profilepic upload
userRoutes.route("/profile/picture").post(authenticate, formidableUpload, updateProfilePicture);
userRoutes.route("/all").get(authenticate, getAllUsers);
userRoutes.route("/:id").get(authenticate, getOtherUserById);

export default userRoutes;
