import express from "express";

import accountsSchema from "../schemas/accountsSchema";
import sessionsSchema, { ISessions } from "../schemas/sessionsSchema";

import Cryptology from "../dependancies/Cryptology";
import mailer from "../dependancies/Mailer";

import { OAuth2Client } from "google-auth-library";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface AuthenticateProps {
  email: string;
  password: string;
  username: string;
  application: string;
}

const authenticate = async (props: AuthenticateProps): Promise<ISessions> => {
  const { email, password, username, application } = props;
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
  if(account.password !== undefined) {
    const confirmation = Cryptology.compare(password, account.password);
    if (confirmation) {
      const token = Cryptology.generateString(64);
      const session = new sessionsSchema({ token: token, account: account._id,  method: method });
      return await session.save();  
    } else {    
      throw new Error("Password confirmation failed, don't try with wrong password!");  
    }  
  } else {
    throw new Error("Password confirmation failed, empty password!");
  }
};  

router.post("/authentication/authenticate", async (req, res) => {
  try {
    const session = await authenticate(req.body);
    let account = await accountsSchema.findOne({ _id: session.account }).exec();
    if(account !== null && account !== undefined) {
      account.password = "";
      return res.status(200).json({ result: "success", message: "Session created.", session: session, account: account });
    } else {
      return res.status(404).json({ result: "success", message: "Account not found." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

interface GoogleAuthenticateProps {
  sub: string,
  email: string,
  given_name: string,
  family_name: string,
}

const googleAuthenticate = async (props: GoogleAuthenticateProps) => {
  const { sub, email, given_name, family_name } = props;
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
  const token = req.headers.authorization;
  try {
    if(process.env.GOOGLE_CLIENT_ID === undefined) {
      return res.status(400).json({ result: "errr", message: "GOOGLE authentication has not been configured."});
    }
    const ticket = await client.verifyIdToken({
      idToken: (token !== undefined) ? token : "",
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if(payload !== undefined) {
      const session = await googleAuthenticate(payload as GoogleAuthenticateProps);
      let account = await accountsSchema.findOne({ _id: session.account }).exec();
      if(account !== null && account !== undefined) {
        account.password = "";
        return res.status(200).json({ result: "success", message: "Session created.", session: session, account: account });
      } else {
        return res.status(404).json({ result: "success", message: "Account not found." });
      }
    } else {
      res.status(404).json({ result: "error", message: "Ticket payload was not found." });
    }
  } catch (error) {
    res.status(500).json({ result: "error", message: error });
  }
});


router.post("/authentication/confirm", async (req, res) => {
  if(req.headers.authorization === undefined) {
    return res.status(500).json({ result: "error", message: "No token given." });
  }
  try {
    const session = await sessionsSchema.findOne({ token: req.headers.authorization }).exec();
    if(session !== null && session !== undefined) {
      let account = await accountsSchema.findOne({ _id: session.account }).exec();
      if(account !== null && account !== undefined) {
        account.password = "";
        return res.status(200).json({ result: "success", message: "Session created.", session: session, account: account });
      } else {
        return res.status(404).json({ result: "success", message: "Account not found." });
      }
    } else {
      return res.status(401).json({ result: "error", message: ""})
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: error });
  }
});

interface RegisterProps {
  email: string,
  password: string,
  username: string,
  fullname: string,
  role: string,
  applications: string,
}

const register = async (registerProps: RegisterProps) => {
  const { email, password, username, fullname, role, applications} = registerProps;
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

interface sendActivationLinkProps {
  email: string,
  activationCode: string,
}

const sendActivationLink = async (props: sendActivationLinkProps) => {
  const { email, activationCode } = props;
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
    if(account !== null && account !== undefined) {
      await sendActivationLink({ email: account.email, activationCode: (account.activationCode !== undefined) ? account.activationCode : "" });
      res.status(200).json({ result: "success", message: "Account activation email has been sent.", account: account });
    } else {
      res.status(404).json({ result: "error", message: "Could not find just created account, so not sending activation email." });
    }
  } catch (error) {
    res.status(500).json({ result: "error", message: error });
  }
});

interface ActivateProps {
  code: string,
}

const activate = async (props: ActivateProps) => {
  return await accountsSchema.findOneAndUpdate({ activationCode: props.code }, { active: true }).exec();
}

router.get("/authentication/activate/:code", async (req, res) => {
  try {
    const account = await activate(req.params);
    if(account !== null && account !== undefined) {
      res.status(200).json({ result: "success", message: "Account activated.", account: account });
    } else {
      res.status(404).json({ result: "error", message: "Could not activate account with the code." });
    }
  } catch (error) {
    res.status(500).json({ result: "error", message: error });
  }
});

const confirm = async (token: string | undefined) => {
  if(token === undefined) {
    throw new Error("Token is undefined");
  }
  const session = await sessionsSchema.findOne({ token: token }).exec();
  if(session !== null && session !== undefined) {
    let account = await accountsSchema.findOne({ _id: session.account }).exec();
    if(account !== null && account !== undefined) {
      account.password = "";
      return { result: "success", session: session, account: account };
    } else {
      throw new Error("Failed to find account with the session.");
    }
  } else {
    throw new Error("Failed to find session with the token.");
  }
}

const getAccount = async (id: string) => {
  let account = await accountsSchema.findOne({ _id: id }).exec();
  if(account !== null && account !== undefined) {
    account.password = undefined;
    account.activationCode = undefined;
    account.source = undefined;
    account.sourceSub = undefined;
    if(process.env.NODE_ENV === "development") console.log(account);
    return { result: "success", account: account };
  } else {
    throw new Error("Could not find account with the id.");
  }
}

export default {
  router,
  authenticate,
  confirm,
  getAccount,
}