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
exports.deleteGroup = exports.getGroup = exports.getGroups = exports.updateGroup = exports.createGroup = exports.router = void 0;
const express_1 = __importDefault(require("express"));
const authentication_js_1 = __importDefault(require("./authentication.js"));
const groupsSchema_1 = __importDefault(require("../schemas/groupsSchema"));
const membersSchema_js_1 = __importDefault(require("../schemas/membersSchema.js"));
/**
 * Group and it's members.
 * /group/      POST    - Create group
 * /group/      PUT     - Update group
 * /groups/     GET     - Get groups
 * /group/:id   GET     - Get group by id
 * /group/:id   DELETE  - Delete group by id
 *
 *
 * createGroup(group: {}, )
 */
const router = express_1.default.Router();
exports.router = router;
const checkGroupPermission = (permission, group, member) => __awaiter(void 0, void 0, void 0, function* () {
    const foundMember = yield membersSchema_js_1.default.findOne({
        group: group._id,
        account: member._id,
    }).exec();
    if (foundMember && foundMember.rights.includes(permission)) {
        return true;
    }
    return false;
});
const createGroup = (group, member) => __awaiter(void 0, void 0, void 0, function* () {
    group = new groupsSchema_1.default(group);
    group = yield group.save();
    const addedMember = new membersSchema_js_1.default({
        group: group._id,
        account: member._id,
        rights: "READ | WRITE | DELETE",
    });
    const savedMember = yield addedMember.save();
    return Object.assign(Object.assign({}, group), { members: [Object.assign({}, savedMember)] });
});
exports.createGroup = createGroup;
router.post("/group/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let authorization = yield authentication_js_1.default.confirm(req.headers.authorization);
        if (authorization.result !== "success") {
            return res.status(401).json({ result: "error", message: "Authorization failed." });
        }
        if (authorization.account !== null) {
            const result = yield createGroup(req.body.group, authorization.account);
            if (result !== null && result !== undefined) {
                return res.status(201).json({ result: "success", message: "Group created", group: result });
            }
            else {
                return res.status(400).json({ result: "error", message: "Group creation failed." });
            }
        }
    }
    catch (error) {
        return res.status(500).json({ result: "error", message: error });
    }
}));
const updateGroup = (group, member) => __awaiter(void 0, void 0, void 0, function* () {
    let permission = yield checkGroupPermission("WRITE", group._id, member._id);
    if (permission == false) {
        return null;
    }
    return yield groupsSchema_1.default.findOneAndUpdate({ _id: group._id }, group, { new: true }).exec();
});
exports.updateGroup = updateGroup;
router.put("/group/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let authorization = yield authentication_js_1.default.confirm(req.headers.authorization);
        if (authorization.result !== "success") {
            return res.status(401).json({ result: "error", message: "Authorization failed." });
        }
        if (authorization.account !== null) {
            const result = yield updateGroup(req.body.group, authorization.account);
            if (result !== null && result !== undefined) {
                return res.status(201).json({ result: "success", message: "Group updated", group: result });
            }
            else {
                return res.status(400).json({ result: "error", message: "Group update failed." });
            }
        }
    }
    catch (error) {
        return res.status(500).json({ result: "error", message: error });
    }
}));
const getGroups = () => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield groupsSchema_1.default.find({}).exec();
    return groups;
});
exports.getGroups = getGroups;
const getGroup = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield groupsSchema_1.default.findOne({ _id: id }).exec();
    return groups;
});
exports.getGroup = getGroup;
router.get("/groups/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let authorization = yield authentication_js_1.default.confirm(req.headers.authorization);
        if (authorization.result !== "success") {
            return res.status(401).json({ result: "error", message: "Authorization failed." });
        }
        let result = yield getGroups();
        if (result !== null && result !== undefined) {
            return res.status(201).json({ result: "success", message: "Groups found", groups: result });
        }
        else {
            return res.status(400).json({ result: "error", message: "Groups not found." });
        }
    }
    catch (error) {
        return res.status(500).json({ result: "error", message: error });
    }
}));
router.get("/group/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let authorization = yield authentication_js_1.default.confirm(req.headers.authorization);
        if (authorization.result !== "success") {
            return res.status(401).json({ result: "error", message: "Authorization failed." });
        }
        let result = yield getGroup(req.params.id);
        if (result !== null && result !== undefined) {
            return res.status(201).json({ result: "success", message: "Groups found", groups: result });
        }
        else {
            return res.status(400).json({ result: "error", message: "Groups not found." });
        }
    }
    catch (error) {
        return res.status(500).json({ result: "error", message: error });
    }
}));
const deleteGroup = (group, account) => __awaiter(void 0, void 0, void 0, function* () {
    let permission = yield checkGroupPermission("DELETE", group, account._id);
    if (permission == false) {
        return null;
    }
    return yield groupsSchema_1.default.findOneAndDelete({ _id: group }).exec();
});
exports.deleteGroup = deleteGroup;
router.delete("/group/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authorization = yield authentication_js_1.default.confirm(req.headers.authorization);
        if (authorization.result !== "success") {
            return res.status(401).json({ result: "error", message: "Authorization failed." });
        }
        if (authorization.account !== null) {
            const group = yield getGroup(req.params.id);
            if (group !== null && group !== undefined) {
                const result = yield deleteGroup(group, authorization.account);
                if (result !== null && result !== undefined) {
                    return res.status(201).json({ result: "success", message: "Groups found", groups: result });
                }
                else {
                    return res.status(400).json({ result: "error", message: "Groups not found." });
                }
            }
        }
    }
    catch (error) {
        return res.status(500).json({ result: "error", message: error });
    }
}));
