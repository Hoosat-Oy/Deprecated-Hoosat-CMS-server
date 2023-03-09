import express from "express";

import accountsSchema from "../schemas/accountsSchema.js";
import sessionsSchema from "../schemas/sessionsSchema.js";

import Cryptology from "../dependancies/Cryptology.js";
import mailer from "../dependancies/Mailer.js";

import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticate = async ({ password, email, username, application } = {}) => {
  let account;
  let method;
  if (email !== undefined && username === undefined && application === undefined) {
    account = await accountsSchema.findOne({ email: email, active: true }).exec();
    method = "email";
  } else if (email === undefined && username !== undefined && application === undefined) {
    account = await accountsSchema.findOne({ username: username, active: true }).exec();
    method = "username";
  } else if (email === undefined && username === undefined && application !== undefined) {
    account = await accountsSchema.findOne({ applications: { $in: [application] } }).exec();
    method = "application";
  }
  if (!account) throw new Error("Failed to fetch account from accountsSchema with the provided information.");
  const confirmation = Cryptology.compare(password, account.password);
  if (confirmation) {
    const token = Cryptology.generateString(64);
    const session = new sessionsSchema({ token: token, account: account._id,  method: method });
    return await session.save();  
  } else {    
    throw new Error("Password confirmation failed, don't try with wrong password!");  
  }  
};  

router.post("/authentication/authenticate", async (req, res) => {
  try {
    const session = await authenticate(req.body);
    let account = await accountsSchema.findOne({ _id: session.account }).exec();
    account.password = "";
    return res.status(200).json({ result: "success", session: session, account: account });
  } catch (error) {
    return res.status(500).json({ result: "error", message: error.message });
  }
});

const googleAuthenticate = async ({sub, email, given_name, family_name}, {}) => {
  let account = await accountsSchema.findOne({ email: email }).exec();
  if (!account) { // create new account for google Authenticated.
    let googler = new accountsSchema({
      email,
      username: given_name + " " + family_name,
      source: "google",
      sourceSub: sub,
      active: true
    });
    account = await googler.save();
  }
  if (account.sourceSub === sub && account.source === "google") {
    const token = Cryptology.generateString(64);
    const session = new sessionsSchema({ token: token, account: account._id, method: "google" });
    return await session.save();
  } else {
    throw new Error("Account is not google account!");
  }
}

router.post("/authentication/google", async (req, res) => {
  const { token } = req.headers.authorization;
  if(process.env.GOOGLE_CLIENT_ID === undefined) {
    return res.status(400).json({ result: "errr", message: "GOOGLE authentication has not been configured."});
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const session = await googleAuthenticate(payload);
    return res.status(200).json({ result: "success", session: session });
  } catch (error) {
    res.status(500).json({ result: "error", message: error.message });
  }
});


router.post("/authentication/confirm", async (req, res) => {
  if(req.headers.authorization === undefined) {
    return res.status(500).json({ result: "error", message: "No token given." });
  }
  try {
    const session = await sessionsSchema.findOne({ token: req.headers.authorization }).exec();
    let account = await accountsSchema.findOne({ _id: session.account }).exec();
    account.password = "";
    return res.status(200).json({ result: "success", session: session, account: account });
  } catch (error) {
    return res.status(500).json({ result: "error", message: error.message });
  }
});

const register = async ({ email, password, username, fullname, role = "none", applications } = {}) => {
  const account = new accountsSchema({
    email,
    password: Cryptology.encrypt(password),
    username,
    fullname,
    role,
    applications,
    activationCode: Cryptology.generateString(16),
    active: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return await account.save();
}

const sendActivationLink = async ({ email, activationCode } = {}) => {
  // TODO: Change registeration activation message and link!
  let subject = "Hoosat CMS käyttäjätunnuksen aktivointi.";
  let message = "Hei sinä,\r\n\r\n";
  message += `Kävit rekisteröitymässä Hoosatin CMS.\r\n\r\n`;
  message += `Voit aktivoida käyttäjätunnuksesi osoitteessa:\r\n`;
  message += `https://hoosat.fi/activate/${activationCode}\r\n\r\n`;
  message += "Ystävällisin terveisin,\r\n\r\nHoosat Oy";
  await mailer.sendMail("authentication@hoosat.fi", email, subject, message);
}

router.post("/authentication/register", async (req, res) => {
  try {
    const account = await register(req.body);
    await sendActivationLink(account);
    res.status(200).json({ result: "success", account: account });
  } catch (error) {
    res.status(500).json({ result: "error", message: error.message });
  }
});

const activate = async ({ code } = {}) => {
  return await accountsSchema.findOneAndUpdate({ activationCode: code }, { active: true }).exec();
}

router.get("/authentication/activate/:code", async (req, res) => {
  try {
    const account = await activate(req.params);
    res.status(200).json({ result: "success", account: account });
  } catch (error) {
    res.status(500).json({ result: "error", message: error.message });
  }
});

export default {
  router,
  authenticate
}