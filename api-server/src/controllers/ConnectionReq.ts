import { ConnectionReq } from "#models";
import { type RequestHandler } from "express";
import { connectionReqInputSchema, connectionReqSchema } from "#schemas";
import { z } from "zod";

type connectionInputDTO = z.infer<typeof connectionReqInputSchema>;
type connectionDTO = z.infer<typeof connectionReqSchema>;
type Idparams = { id: string };
type GetConnectionReqRes = (Omit<connectionDTO, "_id"> & { _id: string })[] | { message: string };
type updatingStatusReqRes = (Omit<connectionDTO, "_id"> & { _id: string }) | { message: string };

const sendConnectionRequest: RequestHandler<{}, GetConnectionReqRes, connectionInputDTO> = async (req, res): Promise<void> => {
  const { fromUserId, toUserId } = req.body;
  if (fromUserId === toUserId) {
    throw new Error("You cannot send a request to yourself", { cause: { status: 400 } });
  }

  // 2. Existence check (The most important part)
  const existingRequest = await ConnectionReq.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
    status: { $in: ["pending", "accepted"] },
  });

  if (existingRequest) {
    // Scenario 1: It's still pending
    if (existingRequest.status === "pending") {
      res.status(400).json({ message: "Connection request is already pending." });
      return;
    }

    // Scenario 2: They are already connected
    if (existingRequest.status === "accepted") {
      res.status(400).json({ message: "You are already connected with this user." });
      return;
    }
  }

  // 3. Create the request
  const connectionRequest = new ConnectionReq({
    fromUserId,
    toUserId,
    status: "pending", // Always hardcode this on creation
  });

  await connectionRequest.save();

  res.status(201).json({ message: "Connection request sent successfully" });
};

const getConnectionRequest: RequestHandler<Idparams, GetConnectionReqRes> = async (req, res): Promise<void> => {
  const { id } = req.params;

  // 1. Fetch the data
  const myReqs = await ConnectionReq.find({ toUserId: id }).populate("fromUserId", "firstName lastName profilePicture").lean().exec();

  // 2. Check if the array is empty
  if (!myReqs || myReqs.length === 0) {
    res.status(404).json({ message: "No requests found for this user" });
    return;
  }
  // 3. Return the array (Convert to plain objects with string IDs)
  const formattedReqs = myReqs.map((req) => {
    const sender = req.fromUserId as any;

    return {
      ...req,
      // Now you can safely access the fields
      senderFirstName: sender.firstName,
      senderLastName: sender.lastName,
      senderProfilePicture: sender.profilePicture,
      // Now you can safely turn the ID into a string
      fromUserId: sender._id.toString(),
      toUserId: req.toUserId.toString(),
      _id: req._id.toString(),
    };
  });
  // console.log(formattedReqs);
  res.json(formattedReqs);
};

const myConnectionRequest: RequestHandler<Idparams, GetConnectionReqRes> = async (req, res): Promise<void> => {
  const { id } = req.params;

  // 1. Fetch the data
  const myReqs = await ConnectionReq.find({ fromUserId: id }).populate("toUserId", "firstName lastName profilePicture").populate("fromUserId", "firstName lastName").lean().exec();

  // 2. Check if the array is empty
  if (!myReqs || myReqs.length === 0) {
    res.status(404).json({ message: "No requests found for this user" });
    return;
  }
  // // 3. Return the array (Convert to plain objects with string IDs)
  const formattedReqs = myReqs.map((req) => {
    const receiver = req.toUserId as any;
    const from = req.fromUserId as any;

    return {
      ...req,
      // Now you can safely access the fields
      // Use optional chaining (?.) and fallbacks
      senderFirstName: from?.firstName || "Unknown",
      senderLastName: from?.lastName || "User",
      receiverFirstName: receiver?.firstName || "Unknown",
      receiverLastName: receiver?.lastName || "User",
      receiverProfilePicture: receiver?.profilePicture || "",
      fromUserId: from?._id?.toString() || "",
      toUserId: receiver?._id?.toString() || "",
      _id: req._id.toString(),
    };
  });
  // console.log(formattedReqs);
  res.json(formattedReqs);
};

const statusUpdate: RequestHandler<Idparams, updatingStatusReqRes> = async (req, res): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  // 1. Fetch the data
  const updatingStatus = await ConnectionReq.findById(id);

  // 2. Check if the document exists
  if (!updatingStatus) {
    res.status(404).json({ message: "Not found" });
    return;
  }
  //3. Updating the status and saving
  updatingStatus.status = status;
  const updated = await updatingStatus.save();

  const formattedResponse = {
    ...updated.toObject(),
    fromUserId: updated.fromUserId.toString(),
    toUserId: updated.toUserId.toString(),
    _id: updated._id.toString(),
  };
  res.json(formattedResponse);
};

export { sendConnectionRequest, getConnectionRequest, statusUpdate, myConnectionRequest };
