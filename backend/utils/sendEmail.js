import nodemailer from 'nodemailer';
import logger from '../middlewares/logger.js';

const sendEmail = async (options) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.info(`[MOCK EMAIL] To: ${options.email} | Subject: ${options.subject}`);
    // Simulate email delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Support'} <${process.env.FROM_EMAIL || 'support@premiumapps.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message || options.html?.replace(/<[^>]+>/g, ''),
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
