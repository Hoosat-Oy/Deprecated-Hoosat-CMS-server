"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const sessionsSchema = new mongoose_1.default.Schema({
    token: {
        type: String,
        required: true,
    },
    account: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Accounts",
        required: true,
    },
    method: {
        type: String,
        required: true,
        default: "unknown"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updtedAt: {
        type: Date,
        default: Date.now
    }
});
exports.default = mongoose_1.default.model("Sessions", sessionsSchema);
