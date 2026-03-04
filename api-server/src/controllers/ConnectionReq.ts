import { ConnectionReq } from "#models";
import { type RequestHandler } from "express";
import { connectionReqInputSchema, connectionReqSchema } from "#schemas/ConnectionReqSchema";
import { z } from "zod";

type connectionInputDTO = z.infer<typeof connectionReqInputSchema>;
type connectionDTO = z.infer<typeof connectionReqSchema>;
type Idparams = { id: string };

const sendConnectionRequest: RequestHandler<{}, connectionDTO | { message: string }, connectionInputDTO> = async (req, res): Promise<void> => {
  const { fromUserId, toUserId, status, message } = req.body;
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
    message,
    status: "pending", // Always hardcode this on creation
  });

  await connectionRequest.save();

  res.status(201).json({ message: "Connection request sent successfully" });
};

const getConnectionRequest: RequestHandler<Idparams, connectionDTO> = async (req, res) => {
  const { id } = req.params;
  const myReq = await ConnectionReq.findById(id);
  if (!myReq) throw new Error("There are no requests", { cause: { status: 404 } });
  res.json({
    ...myReq.toObject(),
    fromUserId: myReq.fromUserId.toString(),
    toUserId: myReq.toUserId.toString(),
  });
};

export { sendConnectionRequest, getConnectionRequest };
