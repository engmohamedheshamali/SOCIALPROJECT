import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "");
    const fileName = `${crypto.randomUUID()}${extension}`;
    cb(null, fileName);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function uploadImage(fieldName) {
  return (req, res, next) => {
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (allowedMimeTypes.has(file.mimetype)) {
          return cb(null, true);
        }

        cb(new Error("image type not allowed"));
      },
    }).single(fieldName);

    upload(req, res, (err) => {
      if (err) {
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "image must be smaller than 5MB"
            : err.message || "invalid image";

        return res.status(422).json({
          errors: {
            [fieldName]: { errors: [message] },
          },
        });
      }

      next();
    });
  };
}
