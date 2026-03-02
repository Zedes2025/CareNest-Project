import { type UserType } from "#types";
import { User } from "#models";
import { type RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const getUsers: RequestHandler = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const getUserById: RequestHandler = async (req, res) => {
  const {
    params: { id },
  } = req;
  if (!isValidObjectId(id))
    throw new Error("Invalid id", { cause: { status: 400 } });
  const user = await User.findById(id).lean();
  if (!user) throw new Error("User not found", { cause: { status: 404 } });
  res.json(user);
};

export const createUser: RequestHandler = async (req, res) => {
  if (!req.body)
    throw new Error("First name, last name, and email are required", {
      cause: { status: 400 },
    });
  const { firstName, lastName, email, password } = req.body;

  const user = await User.create({ firstName, lastName, email, password });
  res.status(201).json(user);
};

// export const updateUser: RequestHandler = async (req, res) => {
//   const {
//     params: { id },
//     body,
//   } = req;
//   if (!isValidObjectId(id))
//     throw new Error("Invalid id", { cause: { status: 400 } });
//   const user = await User.findByIdAndUpdate(id, body, { new: true });
//   if (!user) throw new Error("User not found", { cause: { status: 404 } });
//   res.json(user);
// };

// Extend locally inside this controller file
type UserWithProfile = UserType & {
  isProfileComplete: boolean;
};

export const updateUserProfile: RequestHandler<{ id: string }> = async (
  req,
  res,
) => {
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

  const userWithProfile: UserWithProfile = {
    ...updatedUser,
    _id: updatedUser._id.toString(),

    isProfileComplete: !!(
      updatedUser.firstName &&
      updatedUser.lastName &&
      updatedUser.birthday &&
      updatedUser.location &&
      updatedUser.aboutMe &&
      //   updatedUser.availableTime?.length > 0 &&
      updatedUser.availability?.length > 0 &&
      updatedUser.servicesOffered?.length > 0
    ),
  };

  res.json({
    ...userWithProfile,
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
