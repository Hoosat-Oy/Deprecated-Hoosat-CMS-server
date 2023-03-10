"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_js_1 = __importDefault(require("./authentication.js"));
const articlesSchema_js_1 = __importDefault(require("../schemas/articlesSchema.js"));
const router = express_1.default.Router();
/**
 * Articles aka blog posts.
 * /articles/               POST        - Save a new article
 * /articles/               PUT         - Update article
 * /articles/               GET         - Get all public articles
 * /articles/:id            GET         - Get article by ID
 * /group/articles/         GET         - Get all articles by group ID
 * /account/articles/       GET         - Get all articles by account ID
 * /articles/:id            DELETE      - Delete article by ID
 */
exports.default = {
    router,
};
