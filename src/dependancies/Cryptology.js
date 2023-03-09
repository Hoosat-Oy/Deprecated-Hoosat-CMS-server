import bcrypt from "bcrypt";

// Encrypt password
const encrypt = (password) => {
  let salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(password, salt);
}

// Compare password
const compare = (password, hash) => {
  return bcrypt.compareSync(password, hash);
}

// Generate random string
const generateString = (length) => {
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

