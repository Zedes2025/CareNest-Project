import "#db";
import cors from "cors";
import express from "express";
import { authRouter } from "#routes";
import { errorHandler, notFoundHandler } from "#middlewares";
import { CLIENT_BASE_URL } from "#config";

const app = express();
const port = process.env.PORT || "4000";

app.use(
  cors({
    origin: CLIENT_BASE_URL, // for use with credentials, origin(s) need to be specified
    credentials: true, // sends and receives secure cookies
    exposedHeaders: ["WWW-Authenticate"], // needed to send the 'refresh trigger''
  }),
);

app.use(express.json());

app.use("/auth", authRouter);

app.use("*splat", notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Auth Server listening on port ${port}`);
});
