"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const accountsSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    username: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
    },
    role: {
        type: String,
        default: "none",
    },
    applications: {
        type: [String],
    },
    active: {
        type: Boolean,
        required: true,
        default: false,
    },
    activationCode: {
        type: String,
    },
    recoveryCode: {
        type: String,
    },
    source: {
        type: String,
    },
    sourceSub: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
exports.default = (0, mongoose_1.model)("Accounts", accountsSchema);
