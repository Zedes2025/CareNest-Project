import { ConnectionReq } from "#models";
import { type RequestHandler } from "express";
import { connectionReqInputSchema, connectionReqSchema } from "#schemas";
import { z } from "zod";

type connectionInputDTO = z.infer<typeof connectionReqInputSchema>;
type connectionDTO = z.infer<typeof connectionReqSchema>;
type Idparams = { id: string };
type GetConnectionReqRes = connectionDTO[] | { message: string };

const sendConnectionRequest: RequestHandler<{}, GetConnectionReqRes, connectionInputDTO> = async (req, res): Promise<void> => {
  const { fromUserId, toUserId, profilePicture } = req.body;
  if (fromUserId === toUserId) {
    throw new Error("You cannot send a request to yourself", { cause: { status: 400 } });
  }

  // 2. Existence check (The most important part)
  const existingRequest = await ConnectionReq.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });

  if (existingRequest) {
    res.status(400).json({ message: "Connection request already exists or is pending." });
    return;
  }

  // 3. Create the request
  const connectionRequest = new ConnectionReq({
    fromUserId,
    toUserId,
    profilePicture,
    status: "pending", // Always hardcode this on creation
  });

  await connectionRequest.save();

  res.status(201).json({ message: "Connection request sent successfully" });
};

const getConnectionRequest: RequestHandler<Idparams, GetConnectionReqRes> = async (req, res): Promise<void> => {
  const { id } = req.params;

  // 1. Fetch the data
  const myReqs = await ConnectionReq.find({ toUserId: id }).populate("fromUserId", "firstName lastName").exec();

  // 2. Check if the array is empty
  if (!myReqs || myReqs.length === 0) {
    res.status(404).json({ message: "No requests found for this user" });
    return;
  }

  // 3. Return the array (Convert to plain objects with string IDs)
  //   const formattedReqs = myReqs.map((req) => ({
  //     ...req.toObject(),
  //     fromUserId: req.fromUserId.toString(),
  //     toUserId: req.toUserId.toString(),
  //   }));
  res.json(myReqs);
};

export { sendConnectionRequest, getConnectionRequest };
