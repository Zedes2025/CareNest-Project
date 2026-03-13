import type { File } from "formidable";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
      };
      file?: File;
    }
  }
}
