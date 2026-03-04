import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";

const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;
if (!ACCESS_JWT_SECRET) {
  console.log("ACCESS_JWT_SECRET is not defined in environment variables!");
  process.exit(1);
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.header("authorization");
  const accessToken = authHeader && authHeader.split(" ")[1];
  if (!accessToken) throw new Error("Not authenticated", { cause: { status: 401 } });

  try {
    const decoded = jwt.verify(accessToken, ACCESS_JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.sub)
      throw new Error("Invalid or expired access token", {
        cause: { status: 403 },
      });

    const user = {
      id: decoded.sub,
      roles: decoded.roles,
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(
        new Error("Expired access token", {
          cause: { status: 401, code: "ACCESS_TOKEN_EXPIRED" },
        }),
      );
    } else {
      // call next with a new 401 Error indicated invalid access token
      next(new Error("Invalid access token.", { cause: { status: 401 } }));
    }
  }
};
