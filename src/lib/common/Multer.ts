import express, { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const router = express.Router();

interface ValidatedRequest extends Request {
  isFileValid?: boolean;
}

if(process.env.FILE_DESTINATION === undefined) {
  console.log(".env FILE_DESTINATION == undefined");
}
if(process.env.ALLOWED_FILE_EXTENSIONS === undefined) {
  console.log(".env ALLOWED_FILE_EXTENSIONS == undefined");
}
if(process.env.SINGLE_UPLOAD_ENDPOINTS === undefined) {
  console.log(".env SINGLE_UPLOAD_ENDPOINTS == undefined");
}
if(process.env.MULTIPLE_UPLOAD_ENDPOINTS === undefined) {
  console.log(".env MULTIPLE_UPLOAD_ENDPOINTS == undefined");
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, (process.env.FILE_DESTINATION !== undefined) ? process.env.FILE_DESTINATION : "/");
  },
  filename: (req, file, cb) => {
    let randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    cb(null, randomToken + "-" + file.originalname);
  }
});

// Configure Multer Upload
const upload = multer({ 
  storage: storage,
  fileFilter: function (req: ValidatedRequest, file: Express.Multer.File, cb: FileFilterCallback) {
    const allowedExtensions = (process.env.ALLOWED_FILE_EXTENSIONS !== undefined) ? process.env.ALLOWED_FILE_EXTENSIONS.split(',') : [];
    const allowedExt = new RegExp(`\\.(${allowedExtensions.join('|')})$`, 'i');
    const allowedMime = new RegExp(`^${file.mimetype}$`, 'i');
    let checkExt = allowedExt.test(path.extname(file.originalname));
    let checkMimeType = allowedMime.test(file.mimetype);
    req.isFileValid = checkExt && checkMimeType;
    cb(null, checkExt && checkMimeType);
  }
});

// Configure Multer upload endpoints for Single and Multiple file uploading.
// Allowed file extensions and single/multiple upload endpoints from dotenv. 
let single = upload.single("file");
let singleEndpoints = (process.env.SINGLE_UPLOAD_ENDPOINTS !== undefined) ? process.env.SINGLE_UPLOAD_ENDPOINTS.split(',') : [];
for(let singleEndpoint of singleEndpoints) {
  router.post(singleEndpoint, (req: Request, res: Response, next: NextFunction) => {
    single(req, res, (err: any) => {
      if(err) {
        return res.status(500).json({ message: "File not allowed." });
      }
    });
  });
}
let multiple = upload.array("files", parseInt(process.env.MULTIPLE_FILE_LIMIT!));
let multipleEndpoints = (process.env.MULTIPLE_UPLOAD_ENDPOINTS !== undefined ) ? process.env.MULTIPLE_UPLOAD_ENDPOINTS.split(',') : [];
for(let multipleEndpoint of multipleEndpoints) {
  router.post(multipleEndpoint, (req: Request, res: Response, next: NextFunction) => {
    multiple(req, res, (err: any) => {
      if(err) {
        return res.status(500).json({ message: "File not allowed." });
      }
    });
  });
}

export default {
  router
}