import express from "express";
import cors from "cors";
import "#db";
import { userRoutes, aiChatRoutes, connectionReqRoutes } from "#routes";
import { errorHandler } from "#middlewares";
import formidable from "formidable";

const app = express();
const port = process.env.PORT || 1000;

app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL, // for use with credentials, origin(s) need to be specified
    credentials: true, // sends and receives secure cookies
    exposedHeaders: ["WWW-Authenticate"], // needed to send the 'refresh trigger''
  }),
);
app.use(express.json());
app.use("/users", userRoutes);
app.use("/ai", aiChatRoutes);
app.use("/connectionrequests", connectionReqRoutes);

// formidable
app.post("/api/upload", (req, res, next) => {
  const form = formidable({});

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    console.log(fields, files);
    res.json({ fields, files });
  });
});

app.use("*splat", (req, res) => {
  throw new Error("Not found", { cause: { status: 404 } });
});

app.use(errorHandler);

app.listen(port, () => console.log(`Server is running on port http://localhost:${port}`));
