import express from 'express';
import Mailer from '../../lib/common/Mailer';
import { rateLimitByIP } from '../../lib/common/rateLimit';

const router = express.Router();

router.post("/contact/email", async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
    const rate = await rateLimitByIP(ip, 2500);
    if(rate === true) {
      Mailer.sendMail(req.body.from, req.body.to, req.body.subject, req.body.text);
    }
    return res.status(200).json({ result: "success", message: "Contact request has been sent."})
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

