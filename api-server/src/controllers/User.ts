import { type UserType } from "#types";
import { User } from "#models";
import { type RequestHandler } from "express";
import { isValidObjectId, type Types } from "mongoose";
import { userCreateSchema, userUpdateSchema } from "#schemas";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { getCoordinatesFromAddress } from "../services/geo.services.ts";

// cloudinary configuration
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

interface Address {
  //interface for user address
  hausnr: string;
  street: string;
  plz: string;
  city: string;
  country: string;
}
type UserProfile = z.infer<typeof userUpdateSchema> & {
  _id: string;
  isProfileComplete: boolean;
};

export const getUsers: RequestHandler = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const getMyProfileById: RequestHandler = async (req, res) => {
  const {
    params: { id },
  } = req;
  if (!isValidObjectId(id)) throw new Error("Invalid id", { cause: { status: 400 } });
  const user = await User.findById(id).lean();
  if (!user) throw new Error("User not found", { cause: { status: 404 } });
  res.json(user);
};

export const updateUserProfile: RequestHandler<
  { id: string },
  {},
  z.infer<typeof userUpdateSchema> //UserProfile
> = async (req, res) => {
  const { id } = req.params;

  const updatedUserDoc = await User.findByIdAndUpdate(id, { $set: req.body }, { new: true });

  if (!updatedUserDoc) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const updatedUser = updatedUserDoc.toObject();
  if (updatedUser.address) {
    // Using address to calculate lat/lng, so that we can find the distance between users later, to show nearby users first.
    const coords = await getCoordinatesFromAddress({
      hausnr: updatedUser.address.houseNumber,
      street: updatedUser.address.street,
      plz: updatedUser.address.plz,
      city: updatedUser.address.city,
      country: "Germany", // Default to Germany, can be made dynamic later
    });

    if (coords) {
      // if we got valid coordinates, save them to the user document
      updatedUser.address.latitude = coords.lat;
      updatedUser.address.longitude = coords.lon;
      await User.findByIdAndUpdate(id, {
        $set: {
          // save lat/lng to db
          "address.latitude": coords.lat,
          "address.longitude": coords.lon,
        },
      });
    }
  }
  const userProfile: UserProfile = {
    ...updatedUser,
    _id: updatedUser._id.toString(),
    profilePicture: typeof updatedUser.profilePicture === "string" ? updatedUser.profilePicture : "",
    // availability: Array.isArray(updatedUser.availability) ? updatedUser.availability : [],
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

export const updateProfilePicture: RequestHandler = async (req, res) => {
  try {
    //  Get the file attached by the middleware
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    // Upload to Cloudinary
    // Note: use file.filepath which is the temp path on your server
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: "carenest/profile_pictures",
      transformation: [{ width: 500, height: 500, crop: "fill" }],
    });

    // 3. Update the User profile in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id, // this is run after authenticate middleware with accesstoken, so it brings back the id of the user who has logged in
      { profilePicture: result.secure_url },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4. Return success
    res.status(200).json({
      message: "Profile picture updated successfully!",
      profilePicture: updatedUser.profilePicture, // used to instantly update the useravatar image in frontend
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({ message: "Failed to update profile picture." });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  const {
    params: { id },
  } = req;
  if (!isValidObjectId(id)) throw new Error("Invalid id", { cause: { status: 400 } });
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("User not found", { cause: { status: 404 } });
  res.json({ message: "User deleted" });
};
//===========================================================================================================
//----------------------------------Details of other usres----------------------------------

// 2. Infer the type from the schema

export const publicProfileSchema = userUpdateSchema.omit({
  address: true,
});

type BaseUser = z.infer<typeof userCreateSchema>;

//Modified DTO to include Latitude and Longitude - Konstantin
export type PublicProfileDTO = Omit<BaseUser, "address"> & {
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

// Old Code
// export type PublicProfileDTO = Omit<BaseUser, "address"> & {
//   city: string | null;
// };

export const getAllUsers: RequestHandler<{}, {}, PublicProfileDTO> = async (req, res) => {
  const users = await User.find().lean(); // plain objects

  const publicUsers = users.map((u) => {
    const city = u.address?.city ?? null;
    const latitude = u.address?.latitude ?? null;
    const longitude = u.address?.longitude ?? null;

    const { address, ...rest } = u;

    return {
      ...rest,
      city,
      latitude,
      longitude,
    } satisfies PublicProfileDTO;
  });

  res.json(publicUsers);
};

export const getOtherUserById: RequestHandler = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).lean();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const city = user.address?.city ?? null;
  const latitude = user.address?.latitude ?? null;
  const longitude = user.address?.longitude ?? null;

  const { address, ...rest } = user;

  const publicUser = {
    ...rest,
    city,
    latitude,
    longitude,
  } satisfies PublicProfileDTO;

  res.json(publicUser satisfies PublicProfileDTO);
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
