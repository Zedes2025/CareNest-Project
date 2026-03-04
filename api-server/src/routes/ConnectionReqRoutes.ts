import { Router } from "express";
import { sendConnectionRequest, getConnectionRequest } from "#controllers";
const connectionReqRoutes = Router();

connectionReqRoutes.route("/").post(sendConnectionRequest);
// connectionReqRoutes.route("/").get().post(sendConnectionRequest).put().delete();
connectionReqRoutes.route("/:id").get(getConnectionRequest);

export default connectionReqRoutes;
