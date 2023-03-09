import express from 'express';

import accountsSchema from '../schemas/accountsSchema.js';

const router = express.Router();

router.get("/account/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let account = await accountsSchema.findOne({ _id: id }).exec();
    account.password = undefined;
    account.activationCode = undefined;
    account.source = undefined;
    account.sourceSub = undefined;
    console.log(account);
    return res.status(500).json({ result: "success", message: "Account", account: account });
  } catch (error) {
    return res.status(500).json({ result: "error", message : error });
  }
});

export default { router }