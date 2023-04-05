import { TokenPayload } from "google-auth-library";
import Cryptology from "../common/Cryptology";
import accountsSchema, { AccountsDTO } from "../schemas/accountsSchema";
import sessionsSchema, { SessionsDTO } from "../schemas/sessionsSchema";

export interface AuthenticateDTO {
  email: string;
  password: string;
  username: string;
  application: string;
}

export interface AuthenticatResultDTO {
  result: string,
  message: string,
  session: SessionsDTO,
  account: AccountsDTO
}

export const authenticate = async (props: AuthenticateDTO): Promise<AuthenticatResultDTO> =>  {
  const { email, password, username, application } = props;
  let account;
  let method;
  if(email !== undefined && username === undefined && application === undefined) {
    account = await accountsSchema.findOne({ email: email, active: true }).exec();
    method = "email";
  } else if(email === undefined && username !== undefined && application === undefined) {
    account = await accountsSchema.findOne({ username: username, active: true }).exec();
    method = "username";
  } else if(email === undefined && username === undefined && application !== undefined) {
    account = await accountsSchema.findOne({ applications: { $in: [application] } }).exec();
    method = "application";
  }
  if (account === null || account === undefined) {
    throw new Error("Failed to fetch account from accountsSchema with the provided information.");
  }
  if(account.password === undefined) {
    throw new Error("Account password is empty.");
  }
  const confirmation = Cryptology.compare(password, account.password);
  if(confirmation === false) {
    throw new Error("Could not authenticate account.");
  }
  const token = Cryptology.generateString(64);
  const session = new sessionsSchema({ token: token, account: account._id,  method: method });
  const savedSession = await session.save()
  if(savedSession === null) {
    throw new Error("Could not create session.");
  }
  account.password = "DON'T TRY TO READ THIS, REPORTED YOU RIP TO THE FEDS?"
  return { 
    result: "success", 
    message: "Session created.", 
    session: savedSession, 
    account: account 
  };
}

export const googleAuthenticate = async (
  payload: TokenPayload | undefined
): Promise<AuthenticatResultDTO> => {
  if(payload === undefined) {
    throw new Error("Google payload was undefined.");
  }
  const { sub, email, given_name, family_name } = payload;
  let foundAccount = await accountsSchema.findOne({ email: email }).exec();
  if (foundAccount === null) { // create new account for google Authenticated.
    let googler = new accountsSchema({
      email,
      username: given_name + " " + family_name,
      source: "google",
      sourceSub: sub,
      active: true
    });
    foundAccount = await googler.save();
  }
  if (foundAccount.sourceSub !== sub && foundAccount.source !== "google") {
    throw new Error("Account is not google account!");
  }
  const token = Cryptology.generateString(64);
  const session = new sessionsSchema({ token: token, account: foundAccount._id, method: "google" });
  const savedSession =  await session.save();
  return { 
    result: "success", 
    message: "Session created.", 
    session: savedSession, 
    account: foundAccount 
  };
}

export const confirmToken = async (
  token: string | undefined
): Promise<AuthenticatResultDTO> => {
  if(token === undefined) {
    throw new Error("Token is undefined");
  }
  const session = await sessionsSchema.findOne({ token: token }).exec();
  if(session === null || session === undefined) {
    throw new Error("Session could not be found.");
  }
  let account = await accountsSchema.findOne({ id: session.account }).exec();
  if(account === null || account === undefined) {
    throw new Error("Could not find the account for the session.");
  }
  account.password = "DON'T TRY TO READ THIS, REPORTED YOU RIP TO THE FEDS?"
  return { result: "success", message: "Session token confirmed", session: session, account: account }
}