import { Router } from "express";
import { getMessages, sendMessage } from "#controllers";
import { authenticate } from "#middlewares";

const msgRoutes = Router();
msgRoutes.route("/").post(authenticate, sendMessage);
msgRoutes.route("/:id").get(authenticate, getMessages);
export default msgRoutes;
