"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const origins_js_1 = require("./dependancies/origins.js");
// Initialization of express, dotenv and respolve path
const app = (0, express_1.default)();
dotenv_1.default.config();
const __dirname = path_1.default.resolve();
// Port to listen on
let port = process.env.PORT || 8080;
if (port == 8080) {
    console.log("You can change the default port with PORT in .env\r\n");
}
// Express middleware
app.set("trust proxy", 1);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Select which React client build to deliver.
let build;
app.use((req, res, next) => {
    build = req.headers.hostname;
    next();
});
app.use(express_1.default.static(path_1.default.join(__dirname + '/../client/build')));
// Open MongoDB connection
if (process.env.ATLAS_URI === undefined) {
    console.log("Could not find mongo connection uri ATLAS_URI from .env\r\n");
}
mongoose_1.default.set('strictQuery', true);
mongoose_1.default.connect((process.env.ATLAS_URI !== undefined) ? process.env.ATLAS_URI : "");
// CORS handling
if (process.env.ORIGINS === undefined) {
    console.log("Could not find ORIGINS from .env\r\n");
}
console.log("CORS allowed addresses:");
app.use((0, cors_1.default)({ origin: (origin, callback) => __awaiter(void 0, void 0, void 0, function* () {
        const origins = yield (0, origins_js_1.getOrigins)();
        if (!origin)
            return callback(null, true);
        if (origins.indexOf(origin) === -1) {
            let msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }), credentials: true }));
// Import Multer route to /
const Multer_js_1 = __importDefault(require("./dependancies/Multer.js"));
app.use("/", Multer_js_1.default.router);
const authentication_js_1 = __importDefault(require("./routes/authentication.js"));
app.use("/api", authentication_js_1.default.router);
const articles_js_1 = __importDefault(require("./routes/articles.js"));
app.use("/api", articles_js_1.default.router);
// Catch all routes, serve client build if it exists.
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname + '/../client/build/'));
});
// Start listening for HTTP or HTTPS connections
// depending on the configuration.
if (process.env.PROTOCOL === "HTTPS") {
    if (process.env.HTTPS_KEY !== undefined && process.env.HTTPS_CERT && process.env.HTTPS_CA) {
        const httpsOptions = {
            key: fs_1.default.readFileSync(process.env.HTTPS_KEY),
            cert: fs_1.default.readFileSync(process.env.HTTPS_CERT),
            ca: fs_1.default.readFileSync(process.env.HTTPS_CA),
        };
        const httpsServer = https_1.default.createServer(httpsOptions, app);
        httpsServer.listen(port, () => {
            console.log(`Server listening on port ${port} using https.\r\n`);
        });
    }
}
else {
    const httpServer = http_1.default.createServer(app);
    httpServer.listen(port, () => {
        console.log(`Server listening on port ${port} using http.\r\n`);
    });
}
