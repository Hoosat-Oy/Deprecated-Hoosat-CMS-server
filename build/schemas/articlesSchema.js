"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const articlesSchema = new mongoose_1.default.Schema({
    authorId: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    header: {
        type: String,
        required: true,
    },
    markdown: {
        type: String,
        required: true,
    },
    read: {
        type: Number,
        default: 0
    },
    domain: {
        type: String,
    },
    publish: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
exports.default = mongoose_1.default.model("Articles", articlesSchema);
