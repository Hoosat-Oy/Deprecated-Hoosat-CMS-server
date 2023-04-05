

import Mailer from './Mailer';
interface ContactFromDTO {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export const sendContactForm = (
  cf: ContactFromDTO
) => {
  try {
    Mailer.sendMail(cf.from, cf.to, cf.subject, cf.text);
  } catch(error) {
    if (typeof error === "object" && error !== null) {
      throw new Error(`Error happened in sending mail to ${cf.from}, error: ${error.toString}`);
    } else {
      throw new Error(`Unknown error happened in sending mail to ${cf.from}`);
    }
  }
}