const nodemailer = require('nodemailer');

/**
 * Create and configure Nodemailer transporter
 * Uses environment variables for SMTP configuration
 * Supports Gmail and other SMTP providers
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT) || 587;

  // Validate required environment variables in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP_USER and SMTP_PASS environment variables are required in production');
    }
  }

  const config = {
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for other ports (TLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Gmail-specific: require TLS
    requireTLS: port === 587,
    tls: {
      rejectUnauthorized: true
    }
  };

  const transporter = nodemailer.createTransport(config);

  // Verify transporter configuration on startup (in development)
  if (process.env.NODE_ENV === 'development') {
    transporter.verify()
      .then(() => console.log('SMTP transporter ready:', host))
      .catch(err => console.warn('SMTP verification warning:', err.message));
  }

  return transporter;
};

module.exports = { createTransporter };
