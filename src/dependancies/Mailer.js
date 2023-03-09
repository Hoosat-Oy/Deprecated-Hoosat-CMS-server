import nodemailer from "nodemailer";

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const isValidEmail = (email) => {
    return emailRegex.test(email);
}

const isValidSubject = (subject) => {
  return subject.length >= 5 && subject.length <= 100;
}

const isValidText = (text) => {
  return text.length >= 10 && text.length <= 10000;
}

const sendMail = async (from, to, subject, text) => {
  if(!to.trim()) throw new Error('Email address is required');
  if(!subject.trim()) throw new Error('Subject is required');
  if(!text.trim()) throw new Error('Text is required');
  if(!isValidEmail(to)) {
    throw new Error(`An error occurred while sending email: invalid email address.`);
  }
  if(!isValidSubject(subject)) {
    throw new Error(`Subject is too short or long for email.`);
  }

  if(!isValidText(text)) {
    throw new Error(`Text is too short or long for email.`);
  }
  let transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.USERNAME,
      pass: process.env.PASSWORD,
    },
  });
  let options = {
    from: from,
    to: to,
    subject: subject,
    text: text,
  };
  try {
    let info = await transporter.sendMail(options);
    return info;
  } catch (error) {
    throw new Error(`An error occured while sending email: ${error.message}`);
  }
};

  // Sähköpostiviestin asetukset
  // let mailOptions = {
  //   from: 'YOUR_EMAIL_ADDRESS_HERE',
  //   to: 'TO_EMAIL_ADDRESS_HERE',
  //   subject: 'Testiviesti Nodemailerilla',
  //   text: 'Tämä on testiviesti Nodemailerilla'
  // };

const SMTPSendMail = async (mailOptions) => {
  // Luodaan kuljetin (transporter) Nodemailerille
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || 'mail.shellit.org',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      }
    });

    // Lähetetään sähköposti käyttäen transporter-kuljettimelle määriteltyä konfiguraatiota
    let info = await transporter.sendMail(mailOptions);

    if(process.env.NODE_ENV === "development") console.log('Sähköposti lähetetty: %s', info.messageId);
    return info;
  } catch (err) { }
}

export default { 
  sendMail, 
  SMTPSendMail 
};