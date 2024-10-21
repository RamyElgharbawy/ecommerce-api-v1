const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1- create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // 2- define mail options
  const mailOptions = {
    from: `E-Shop App <${process.env.MAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.massage,
  };
  // 3- send email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
