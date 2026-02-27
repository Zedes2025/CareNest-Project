import express from "express";
import cors from "cors";
import "#db";
import { userRoute, aiConversationRoute, connectionReqRoute } from "#routes";

import { errorHandler } from "#middlewares";
const app = express();
const port = process.env.PORT || 1000;
app.use((req, res, next) => {
  next();
});

app.use(cors());

app.use(express.json());
app.use("/users", userRoute);
app.use("/ai-conversations", aiConversationRoute);
app.use("/connection-requests", connectionReqRoute);

app.use("*splat", (req, res) => {
  throw new Error("Not found", { cause: { status: 404 } });
});

app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server is running on port http://localhost:${port}`),
);
