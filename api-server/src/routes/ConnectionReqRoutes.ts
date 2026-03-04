import { Router } from "express";
import { sendConnectionRequest } from "#controllers";
const connectionReqRoutes = Router();

connectionReqRoutes.route("/").get().post(sendConnectionRequest);
// connectionReqRoutes.route("/").get().post(sendConnectionRequest).put().delete();
// connectionReqRoutes.route("/:id").get().delete();

export default connectionReqRoutes;
