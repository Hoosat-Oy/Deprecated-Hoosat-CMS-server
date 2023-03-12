import Cryptology from "./common/Cryptology";
import Mailer from "./common/Mailer";
import accountsSchema, { AccountsDTO } from "./schemas/accountsSchema"

interface AccountResultDTO {
  result: string,
  message: string,
  account: AccountsDTO
}

export const createAccount = async(account: AccountsDTO): Promise<AccountResultDTO> => {
  if(account.password === undefined) {
    throw new Error("Account password was emtpy.");
  }
  const newAccount = new accountsSchema({
    email: account.email,
    password: Cryptology.encrypt(account.password),
    username: account.username,
    fullname: account.fullname,
    role: account.role,
    applications: account.applications,
    active: false,
    activationCode: Cryptology.generateString(16),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  const savedAccount = await newAccount.save();
  return {
    result: "success",
    message: "Account created.",
    account: savedAccount,
  }
}

export const getAccount = async (account: AccountsDTO): Promise<AccountResultDTO> => {
  const foundAccount = await accountsSchema.findOne({ _id: account._id }).exec();
  if(foundAccount === null) {
    throw new Error("Could not find a account with the identifier.");
  }
  return {
    result: "success",
    message: "Found account with the identifier",
    account: foundAccount,
  }
}

export const sendActivationLink = async (
  email: string,
  activationCode: string
) => {;
  // TODO: Change registeration activation message and link!
  let subject = "Hoosat CMS käyttäjätunnuksen aktivointi.";
  let message = "Hei sinä,\r\n\r\n";
  message += `Kävit rekisteröitymässä Hoosatin CMS.\r\n\r\n`;
  message += `Voit aktivoida käyttäjätunnuksesi osoitteessa:\r\n`;
  message += `https://hoosat.fi/activate/${activationCode}\r\n\r\n`;
  message += "Ystävällisin terveisin,\r\n\r\nHoosat Oy";
  return await Mailer.sendMail("authentication@hoosat.fi", email, subject, message);
}

export const activateAccount = async (
  code: string
): Promise<AccountResultDTO> => {
  const account = await accountsSchema.findOneAndUpdate({ activationCode: code }, { active: true }, { new: true}).exec();
  if(account == null) {
    throw new Error("Failed to activate account.");
  }
  return {
    result: "success",
    message: "Account activated",
    account: account,
  }
}