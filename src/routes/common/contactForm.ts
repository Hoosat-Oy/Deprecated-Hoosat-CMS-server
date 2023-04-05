import express from 'express';
import { sendContactForm } from '../../lib/common/contactForm';

const router = express.Router();

router.post("/contact/email", async (req, res) => {
  try {
    sendContactForm(req.body.contact);
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
