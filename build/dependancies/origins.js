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
exports.getOrigins = void 0;
const originSchema_1 = __importDefault(require("../schemas/originSchema"));
const getOrigins = () => __awaiter(void 0, void 0, void 0, function* () {
    const dbOrigins = (yield originSchema_1.default.find({}).exec()).map((origin) => {
        return origin.address;
    });
    if (dbOrigins.length > 0) {
        return dbOrigins;
    }
    else if ((process.env.ORIGINS !== undefined) && Array.isArray(process.env.ORIGINS) && process.env.ORIGINS.length > 0) {
        return process.env.ORIGINS;
    }
    else {
        return ["http://localhost:3000"];
    }
});
exports.getOrigins = getOrigins;
