import formidable, { type Part } from "formidable";
import type { RequestHandler } from "express";

// formidable

const filter = ({ mimetype }: Part) => {
  // If mimetype exists AND contains "image", return true to accept it
  if (mimetype && mimetype.includes("image")) {
    return true;
  }
  // Otherwise, throw the error
  throw new Error("Only images are allowed", { cause: { status: 400 } });
};

const maxFileSize = 10 * 1024 * 1024; //  Limit  then file size to 10MB

const formidableUpload: RequestHandler = (req, res, next) => {
  const form = formidable({
    filter,
    multiples: false, // allows one profile picture for uploading
    maxFileSize,
  });

  // _fields- means it is notused so we r mentioning it with "_"
  form.parse(req, (err, _fields, files) => {
    if (err) {
      return next(err);
    }

    // Check if the specific field 'profilePicture' exists
    const file = files.profilePicture ? files.profilePicture[0] : null;

    if (!file) {
      return res.status(400).json({ message: "No profile picture uploaded" });
    }

    // Attach ONLY the file to the request object
    req.file = file;

    next();
  });
};

export default formidableUpload;
