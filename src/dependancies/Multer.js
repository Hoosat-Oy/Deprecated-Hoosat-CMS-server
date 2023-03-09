import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FILE_DESTINATION);
  },
  filename: (req, file, cb) => {
    let randomToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    cb(null, randomToken + "-" + file.originalname);
  }
});

// Configure Multer Upload
const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedExtensions = process.env.ALLOWED_FILE_EXTENSIONS.split(',');
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
let singleEndpoints = process.env.SINGLE_UPLOAD_ENDPOINTS;
for(let singleEndpoint in singleEndpoints) {
  router.post(singleEndpoint, (req, res) => {
    single(req, res, (err) => {
      if(err) {
        return res.status(500).json({ message: "File not allowed." });
      }
    });
  });
}
let multiple = upload.array("files", process.env.MULTIPLE_FILE_LIMIT);
let multipleEndpoints = process.env.MULTIPLE_UPLOAD_ENDPOINTS;
for(let singleEndpoint in singleEndpoints) {
  router.post(singleEndpoint, (req, res) => {
    multiple(req, res, (err) => {
      if(err) {
        return res.status(500).json({ message: "File not allowed." });
      }
    });
  });
}

export default {
  router
}