import express from "express";


import { OAuth2Client } from "google-auth-library";
import { authenticate, confirmToken, googleAuthenticate } from "../lib/sessions";
import { activateAccount, createAccount, sendActivationLink } from "../lib/accounts";

/**
 * 
 * @route POST /authentication/register
 * @route POST /authentication/authenticate
 * @route POST /authentication/google
 * @route POST /authentication/confirm
 * @route POST /authentication/activate/:code
 */


const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Authenticate user with email and password.
 * @route POST /authentication/authenticate
 * @group Authentication - User authentication APIs
 * @param {Object} req - The HTTP request Object.
 * @param {Object} res - The HTTP response Object.
 * @param {Object} req.body.credentials - User credentials Object.
 * @returns {Object} User Object.
 * @throws {Object} Error Object.
 */
router.post("/authentication/authenticate", async (req, res) => {
  try {
    return res.status(200).json(await authenticate(req.body.credentials));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

/**
 * Authenticate user with Google OAuth token.
 * @route POST /authentication/google
 * @group Authentication - User authentication APIs
 * @param {Object} req - The HTTP request Object.
 * @param {Object} res - The HTTP response Object.
 * @param {string} req.headers.authorization - Google OAuth token.
 * @returns {Object} User Object.
 * @throws {Object} Error Object.
 */
router.post("/authentication/google", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if(process.env.GOOGLE_CLIENT_ID === undefined) {
      return res.status(400).json({ result: "errr", message: "GOOGLE authentication has not been configured."});
    }
    const ticket = await client.verifyIdToken({
      idToken: (token !== undefined) ? token : "",
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if(payload === undefined) {
      res.status(404).json({ result: "error", message: "Ticket payload was not found." });
    }
    return res.status(200).json(await googleAuthenticate(payload));
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

/**
 * Confirm user account with activation token.
 * @route POST /authentication/confirm
 * @group Authentication - User authentication APIs
 * @param {Object} req - The HTTP request Object.
 * @param {Object} res - The HTTP response Object.
 * @param {string} req.headers.authorization - User activation token.
 * @returns {Object} Confirmation result Object.
 * @throws {Object} Error Object.
 */
router.post("/authentication/confirm", async (req, res) => {
  if(req.headers.authorization === undefined) {
    return res.status(500).json({ result: "error", message: "No token given." });
  }
  try {
    const result = await confirmToken(req.headers.authorization);
    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

/**
 * Register a new user account and send activation email.
 * @route POST /authentication/register
 * @group Authentication - User authentication APIs
 * @param {Object} req - The HTTP request Object.
 * @param {Object} res - The HTTP response Object.
 * @param {Object} req.body.account - New user account Object.
 * @returns {Object} Success Object with account details.
 * @throws {Object} Error Object.
 */
router.post("/authentication/register", async (req, res) => {
  try {
    const accounResult = await createAccount(req.body.account);
    const { account } = accounResult
    if(account.email === undefined) {
      throw new Error("Just created account email is undefined.");
    }
    if(account.activationCode === undefined) {
      throw new Error("Just created account activation code is undefined.");
    }
    const mailResult = await sendActivationLink(account.email, account.activationCode);
    if(mailResult === false) {
      throw new Error("Failed to email activation link, but account was created.");
    }
    res.status(200).json({ result: "success", message: "Account created and activation email has been sent.", account: account });
  } catch (error) {
    console.log(error);
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});
/**
 * Activate user account using provided activation code
 * @route POST /authentication/activate/:code
 * @group Authentication
 * @param {Object} req - The HTTP request Object.
 * @param {Object} res - The HTTP response Object.
 * @param {string} req.params.code - The activation code for the account to be activated
 * @returns {Object} Success Object with account details.
 * @throws {Object} Error Object.
*/
router.get("/authentication/activate/:code", async (req, res) => {
  try {
    const account = await activateAccount(req.params.code);
    if(account !== null && account !== undefined) {
      res.status(200).json({ result: "success", message: "Account activated.", account: account });
    } else {
      res.status(404).json({ result: "error", message: "Could not activate account with the code." });
    }
  } catch (error) {
    console.log(error);
    if (typeof error === "object" && error !== null) {
      return res.status(500).json({ result: "error", message: error.toString() });
    } else {
      return res.status(500).json({ result: "error", message: "Unknown error" });
    }
  }
});

export default {
  router,
}