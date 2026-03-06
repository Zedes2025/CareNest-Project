import { Router } from "express";
import { validateBodyZod } from "#middlewares";
import { connectionReqInputSchema } from "#schemas";
import { sendConnectionRequest, getConnectionRequest } from "#controllers";
const connectionReqRoutes = Router();

connectionReqRoutes.route("/").post(validateBodyZod(connectionReqInputSchema), sendConnectionRequest);
// connectionReqRoutes.route("/").get().post(sendConnectionRequest).put().delete();
connectionReqRoutes.route("/:id").get(getConnectionRequest);

export default connectionReqRoutes;
