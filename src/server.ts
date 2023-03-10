import fs from "fs";
import http from "http";
import https from "https";
import express from "express";
import path from 'path';
import cors  from "cors";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import { getOrigins } from "./dependancies/origins.js";

// Initialization of express, dotenv and respolve path
const app = express();
dotenv.config();
const dirname = path.resolve();

// Port to listen on
let port = process.env.PORT || 8080;
if(port == 8080) {
  console.log("You can change the default port with PORT in .env\r\n");
}

// Express middleware
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Select which React client build to deliver.
let build: string | string[] | undefined;
app.use((req, res, next) => {
  build = req.headers.hostname;
  next();
});

app.use(express.static(path.join(dirname + '/../client/build')));

// Open MongoDB connection
if(process.env.ATLAS_URI === undefined) {
  console.log("Could not find mongo connection uri ATLAS_URI from .env\r\n");
}
mongoose.set('strictQuery', true);
mongoose.connect((process.env.ATLAS_URI !== undefined) ? process.env.ATLAS_URI : "");

// CORS handling
if(process.env.ORIGINS === undefined) {
  console.log("Could not find ORIGINS from .env\r\n");
}
let origins: string[];
(async () => {
  console.log("CORS allowed addresses:");
  origins = await getOrigins();
  console.log(origins);
})();
app.use(cors({ origin : async (origin: any, callback: (arg0: Error | null, arg1: boolean) => any) => {
  if(!origin) return callback(null, true);
  if(origins.indexOf(origin) === -1) {
    let msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
    return callback(new Error(msg), false);
  }
  return callback(null, true);
}, credentials: true }));

// Import Multer route to /
import multer from "./dependancies/Multer.js";
app.use("/", multer.router);
import authentication from "./routes/authentication.js";
app.use("/api", authentication.router);
import articles from "./routes/articles.js";
app.use("/api", articles.router);


// Catch all routes, serve client build if it exists.
app.get('*', (req, res) => {
  res.sendFile(path.join(dirname + '/../client/build/'));
});

// Start listening for HTTP or HTTPS connections
// depending on the configuration.
if(process.env.PROTOCOL === "HTTPS") {
  if(process.env.HTTPS_KEY !== undefined && process.env.HTTPS_CERT && process.env.HTTPS_CA) {
    const httpsOptions = {
      key: fs.readFileSync(process.env.HTTPS_KEY),
      cert: fs.readFileSync(process.env.HTTPS_CERT),
      ca: fs.readFileSync(process.env.HTTPS_CA),
    };
    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(port, () => {
      console.log(`Server listening on port ${port} using https.\r\n`);
    });
  }
} else {
  const httpServer = http.createServer(app);
  httpServer.listen(port, () => {
    console.log(`Server listening on port ${port} using http.\r\n`);
  });
}
