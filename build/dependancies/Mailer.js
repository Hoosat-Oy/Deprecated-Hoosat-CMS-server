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
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const isValidEmail = (email) => {
    return emailRegex.test(email);
};
const isValidSubject = (subject) => {
    return subject.length >= 5 && subject.length <= 100;
};
const isValidText = (text) => {
    return text.length >= 10 && text.length <= 10000;
};
const sendMail = (from, to, subject, text) => __awaiter(void 0, void 0, void 0, function* () {
    if (!to.trim())
        throw new Error('Email address is required');
    if (!subject.trim())
        throw new Error('Subject is required');
    if (!text.trim())
        throw new Error('Text is required');
    if (!isValidEmail(to)) {
        throw new Error(`An error occurred while sending email: invalid email address.`);
    }
    if (!isValidSubject(subject)) {
        throw new Error(`Subject is too short or long for email.`);
    }
    if (!isValidText(text)) {
        throw new Error(`Text is too short or long for email.`);
    }
    let transporter = nodemailer_1.default.createTransport({
        service: process.env.SERVICE,
        auth: {
            user: process.env.USERNAME,
            pass: process.env.PASSWORD,
        },
    });
    let options = {
        from: from,
        to: to,
        subject: subject,
        text: text,
    };
    try {
        let info = yield transporter.sendMail(options);
        return info;
    }
    catch (error) {
        throw new Error(`An error occured while sending email: ${error.message}`);
    }
});
// Sähköpostiviestin asetukset
// let mailOptions = {
//   from: 'YOUR_EMAIL_ADDRESS_HERE',
//   to: 'TO_EMAIL_ADDRESS_HERE',
//   subject: 'Testiviesti Nodemailerilla',
//   text: 'Tämä on testiviesti Nodemailerilla'
// };
const SMTPSendMail = (mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
    // Luodaan kuljetin (transporter) Nodemailerille
    try {
        let transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_SERVER || 'mail.shellit.org',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            }
        });
        // Lähetetään sähköposti käyttäen transporter-kuljettimelle määriteltyä konfiguraatiota
        let info = yield transporter.sendMail(mailOptions);
        if (process.env.NODE_ENV === "development")
            console.log('Sähköposti lähetetty: %s', info.messageId);
        return info;
    }
    catch (err) { }
});
exports.default = {
    sendMail,
    SMTPSendMail
};
