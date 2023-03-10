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
const express_1 = __importDefault(require("express"));
const accountsSchema_js_1 = __importDefault(require("../schemas/accountsSchema.js"));
const sessionsSchema_js_1 = __importDefault(require("../schemas/sessionsSchema.js"));
const Cryptology_js_1 = __importDefault(require("../dependancies/Cryptology.js"));
const Mailer_js_1 = __importDefault(require("../dependancies/Mailer.js"));
const google_auth_library_1 = require("google-auth-library");
const router = express_1.default.Router();
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const authenticate = ({ password, email, username, application } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    let account;
    let method;
    if (email !== undefined && username === undefined && application === undefined) {
        account = yield accountsSchema_js_1.default.findOne({ email: email, active: true }).exec();
        method = "email";
    }
    else if (email === undefined && username !== undefined && application === undefined) {
        account = yield accountsSchema_js_1.default.findOne({ username: username, active: true }).exec();
        method = "username";
    }
    else if (email === undefined && username === undefined && application !== undefined) {
        account = yield accountsSchema_js_1.default.findOne({ applications: { $in: [application] } }).exec();
        method = "application";
    }
    if (!account)
        throw new Error("Failed to fetch account from accountsSchema with the provided information.");
    const confirmation = Cryptology_js_1.default.compare(password, account.password);
    if (confirmation) {
        const token = Cryptology_js_1.default.generateString(64);
        const session = new sessionsSchema_js_1.default({ token: token, account: account._id, method: method });
        return yield session.save();
    }
    else {
        throw new Error("Password confirmation failed, don't try with wrong password!");
    }
});
router.post("/authentication/authenticate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield authenticate(req.body);
        let account = yield accountsSchema_js_1.default.findOne({ _id: session.account }).exec();
        account.password = "";
        return res.status(200).json({ result: "success", session: session, account: account });
    }
    catch (error) {
        return res.status(500).json({ result: "error", message: error.message });
    }
}));
const googleAuthenticate = ({ sub, email, given_name, family_name }, {}) => __awaiter(void 0, void 0, void 0, function* () {
    let account = yield accountsSchema_js_1.default.findOne({ email: email }).exec();
    if (!account) { // create new account for google Authenticated.
        let googler = new accountsSchema_js_1.default({
            email,
            username: given_name + " " + family_name,
            source: "google",
            sourceSub: sub,
            active: true
        });
        account = yield googler.save();
    }
    if (account.sourceSub === sub && account.source === "google") {
        const token = Cryptology_js_1.default.generateString(64);
        const session = new sessionsSchema_js_1.default({ token: token, account: account._id, method: "google" });
        return yield session.save();
    }
    else {
        throw new Error("Account is not google account!");
    }
});
router.post("/authentication/google", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.headers.authorization;
    if (process.env.GOOGLE_CLIENT_ID === undefined) {
        return res.status(400).json({ result: "errr", message: "GOOGLE authentication has not been configured." });
    }
    try {
        const ticket = yield client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const session = yield googleAuthenticate(payload);
        return res.status(200).json({ result: "success", session: session });
    }
    catch (error) {
        res.status(500).json({ result: "error", message: error.message });
    }
}));
router.post("/authentication/confirm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.headers.authorization === undefined) {
        return res.status(500).json({ result: "error", message: "No token given." });
    }
    try {
        const session = yield sessionsSchema_js_1.default.findOne({ token: req.headers.authorization }).exec();
        let account = yield accountsSchema_js_1.default.findOne({ _id: session.account }).exec();
        account.password = "";
        return res.status(200).json({ result: "success", session: session, account: account });
    }
    catch (error) {
        return res.status(500).json({ result: "error", message: error.message });
    }
}));
const register = ({ email, password, username, fullname, role = "none", applications } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const account = new accountsSchema_js_1.default({
        email,
        password: Cryptology_js_1.default.encrypt(password),
        username,
        fullname,
        role,
        applications,
        activationCode: Cryptology_js_1.default.generateString(16),
        active: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    });
    return yield account.save();
});
const sendActivationLink = ({ email, activationCode } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: Change registeration activation message and link!
    let subject = "Hoosat CMS käyttäjätunnuksen aktivointi.";
    let message = "Hei sinä,\r\n\r\n";
    message += `Kävit rekisteröitymässä Hoosatin CMS.\r\n\r\n`;
    message += `Voit aktivoida käyttäjätunnuksesi osoitteessa:\r\n`;
    message += `https://hoosat.fi/activate/${activationCode}\r\n\r\n`;
    message += "Ystävällisin terveisin,\r\n\r\nHoosat Oy";
    yield Mailer_js_1.default.sendMail("authentication@hoosat.fi", email, subject, message);
});
router.post("/authentication/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield register(req.body);
        yield sendActivationLink(account);
        res.status(200).json({ result: "success", account: account });
    }
    catch (error) {
        res.status(500).json({ result: "error", message: error.message });
    }
}));
const activate = ({ code } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return yield accountsSchema_js_1.default.findOneAndUpdate({ activationCode: code }, { active: true }).exec();
});
router.get("/authentication/activate/:code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield activate(req.params);
        res.status(200).json({ result: "success", account: account });
    }
    catch (error) {
        res.status(500).json({ result: "error", message: error.message });
    }
}));
const confirm = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield sessionsSchema_js_1.default.findOne({ token: req.headers.authorization }).exec();
        let account = yield accountsSchema_js_1.default.findOne({ _id: session.account }).exec();
        account.password = "";
        return { result: "success", session: session, account: account };
    }
    catch (error) {
        if (process.env.NODE_ENV === "development")
            console.log(error);
        throw new Error(error);
    }
});
const getAccount = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let account = yield accountsSchema_js_1.default.findOne({ _id: id }).exec();
        account.password = undefined;
        account.activationCode = undefined;
        account.source = undefined;
        account.sourceSub = undefined;
        if (process.env.NODE_ENV === "development")
            console.log(account);
        return { result: "success", message: "Account", account: account };
    }
    catch (error) {
        if (process.env.NODE_ENV === "development")
            console.log(error);
        throw new Error(error);
    }
});
exports.default = {
    router,
    authenticate,
    confirm,
    getAccount,
};
