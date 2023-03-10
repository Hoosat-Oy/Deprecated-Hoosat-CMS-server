"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
// Encrypt password
const encrypt = (password) => {
    let salt = bcrypt_1.default.genSaltSync(12);
    return bcrypt_1.default.hashSync(password, salt);
};
// Compare password
const compare = (password, hash) => {
    return bcrypt_1.default.compareSync(password, hash);
};
// Generate random string
const generateString = (length) => {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        result = result + characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
exports.default = {
    encrypt,
    compare,
    generateString,
};
