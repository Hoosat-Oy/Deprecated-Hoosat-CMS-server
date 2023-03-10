import nodemailer, { Transporter } from "nodemailer";

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const isValidEmail = (email: string): boolean => {
    return emailRegex.test(email);
}

const isValidSubject = (subject: string): boolean => {
  return subject.length >= 5 && subject.length <= 100;
}

const isValidText = (text: string): boolean => {
  return text.length >= 10 && text.length <= 10000;
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

const sendMail = async (from: string, to: string, subject: string, text: string): Promise<any> => {
  let options: MailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text,
  };
  if(!options.to.trim()) throw new Error('Email address is required');
  if(!options.subject.trim()) throw new Error('Subject is required');
  if(!options.text.trim()) throw new Error('Text is required');
  if(!isValidEmail(options.to)) {
    throw new Error(`An error occurred while sending email: invalid email address.`);
  }
  if(!isValidSubject(options.subject)) {
    throw new Error(`Subject is too short or long for email.`);
  }
  if(!isValidText(options.text)) {
    throw new Error(`Text is too short or long for email.`);
  }
  let transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.USERNAME,
      pass: process.env.PASSWORD,
    },
  });
  try {
    let info = await transporter.sendMail(options);
    return info;
  } catch (error) {
    throw new Error("Failed to send email.");
  }
};

const SMTPSendMail = async (options: MailOptions): Promise<any> => {
  if(!options.to.trim()) throw new Error('Email address is required');
  if(!options.subject.trim()) throw new Error('Subject is required');
  if(!options.text.trim()) throw new Error('Text is required');
  if(!isValidEmail(options.to)) {
    throw new Error(`An error occurred while sending email: invalid email address.`);
  }
  if(!isValidSubject(options.subject)) {
    throw new Error(`Subject is too short or long for email.`);
  }
  if(!isValidText(options.text)) {
    throw new Error(`Text is too short or long for email.`);
  }
  try {
    let transporter: Transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || 'mail.shellit.org',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      }
    });

    let info = await transporter.sendMail(options);
    return info;
  } catch (err) { 
    throw new Error("Failed to send email.");
  }
}

export default { 
  sendMail, 
  SMTPSendMail 
};