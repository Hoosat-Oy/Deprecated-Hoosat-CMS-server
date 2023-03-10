import bcrypt from "bcrypt";

// Encrypt password
const encrypt = (password: string): string => {
  let salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(password, salt);
}

// Compare password
const compare = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
}

// Generate random string
const generateString = (length: number): string => {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result = result + characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default {
  encrypt,
  compare,
  generateString,
}