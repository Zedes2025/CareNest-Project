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
