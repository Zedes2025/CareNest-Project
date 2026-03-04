import { type UserType } from "#types";
import { User } from "#models";
import { type RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { userCreateSchema, userUpdateSchema } from "#schemas";
import { z } from "zod";

export const getUsers: RequestHandler = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const getMyProfileById: RequestHandler = async (req, res) => {
  const {
    params: { id },
  } = req;
  if (!isValidObjectId(id))
    throw new Error("Invalid id", { cause: { status: 400 } });
  const user = await User.findById(id).lean();
  if (!user) throw new Error("User not found", { cause: { status: 404 } });
  res.json(user);
};

//register:  auth server provides this, so no need to implement here. This is just for testing with postman, can be removed later
// export const createUser: RequestHandler<
//   {},
//   {},
//   z.infer<typeof userCreateSchema>
// > = async (req, res) => {
//   // onlyregistratiom
//   if (!req.body)
//     throw new Error("First name, last name, and email are required", {
//       cause: { status: 400 },
//     });
//   const { firstName, lastName, email, password } = req.body;

//   const user = await User.create({ firstName, lastName, email, password });
//   res.status(201).json(user);
// };

type UserProfile = z.infer<typeof userUpdateSchema> & {
  _id: string;
  isProfileComplete: boolean;
};

export const updateUserProfile: RequestHandler<
  { id: string },
  {},
  z.infer<typeof userUpdateSchema> //UserProfile
> = async (req, res) => {
  const { id } = req.params;

  const updatedUserDoc = await User.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true },
  );

  if (!updatedUserDoc) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const updatedUser = updatedUserDoc.toObject();

  const userProfile: UserProfile = {
    ...updatedUser,

    isProfileComplete: !!(
      updatedUser.firstName &&
      updatedUser.lastName &&
      updatedUser.birthday &&
      updatedUser.address &&
      updatedUser.aboutMe &&
      //   updatedUser.availableTime?.length > 0 &&
      updatedUser.availability?.length > 0 &&
      updatedUser.servicesOffered?.length > 0
    ),
  };

  res.json({
    ...userProfile,
  });
};

export const deleteUser: RequestHandler = async (req, res) => {
  const {
    params: { id },
  } = req;
  if (!isValidObjectId(id))
    throw new Error("Invalid id", { cause: { status: 400 } });
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("User not found", { cause: { status: 404 } });
  res.json({ message: "User deleted" });
};
//===========================================================================================================
//----------------------------------Details of other usres----------------------------------

// 2. Infer the type from the schema

export const publicProfileSchema = userUpdateSchema.omit({
  location: true,
  birthday: true,
});
type PublicProfileDTO = Omit<
  z.infer<typeof userCreateSchema>,
  "location" | "birthday"
>;

export const getAllUsers: RequestHandler<{}, {}, PublicProfileDTO> = async (
  req,
  res,
) => {
  const users = await User.find().lean(); // plain objects

  const publicUsers = users.map(
    ({ location, birthday, ...rest }) => rest satisfies PublicProfileDTO,
  );

  res.json(publicUsers);
};

export const getOtherUserById: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).lean();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // strip location and birthday
  const { location, birthday, ...publicUser } = user;

  res.json(publicUser satisfies PublicProfileDTO);
};
