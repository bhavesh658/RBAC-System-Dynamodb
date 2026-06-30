const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const logger = require('../../utils/logger');



const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST?.trim(),
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASSWORD?.trim(),
  },
});

transporter.verify()
  .then(() => logger.info("SMTP connection successful and ready to send emails"))
  .catch((err) => logger.error("SMTP connection failed on startup:", err));


const sendEmail = async ({ to, subject, html }) => {

  const info = await transporter.sendMail({
    from:
      process.env.EMAIL_FROM?.trim() ||
      process.env.EMAIL_USER?.trim(),
    to,
    subject,
    html,
  });

  logger.info("Email sent:", info.messageId);

  return info;
};
const generateAccessToken = (user) => {
  if (!user || !user.userId
    // || !user.role || !user.department
  ) {
    throw new Error('Invalid user object for token generation');
  }
  const payload = {
    sub: user.userId,
    role: user.role,
    department: user.department,
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    }
  );

  return token;
};

const generateRefreshToken = (
  user
) => {

  if (!user || !user.userId) {
    throw new Error('Invalid user object for refresh token generation');
  }
  return jwt.sign(
    {
      sub: user.userId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );
};




module.exports = {
  generateAccessToken, sendEmail, generateRefreshToken
};