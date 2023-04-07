import express from 'express';
import { sendContactForm } from '../../lib/common/contactForm';
import { rateLimitByIP } from '../../lib/common/rateLimit';

const router = express.Router();

router.post("/contact/email", async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
    const rate = await rateLimitByIP(ip, 2500);
    if(rate === true) {
      sendContactForm(req.body.contact);
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

