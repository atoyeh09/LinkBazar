const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('nodemailer-express-handlebars');
const cryptoRandomString = require('crypto-random-string');

// Create email templates directory if it doesn't exist
const templatesDir = path.join(__dirname, '../templates/emails');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Create a transporter
let transporter;

// Initialize the transporter based on environment
const initTransporter = () => {
  // Check if email configuration is provided
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Use actual SMTP settings
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Configure handlebars for email templates
    transporter.use('compile', handlebars({
      viewEngine: {
        extName: '.handlebars',
        partialsDir: path.join(__dirname, '../templates/emails'),
        layoutsDir: path.join(__dirname, '../templates/emails/layouts'),
        defaultLayout: 'main',
      },
      viewPath: path.join(__dirname, '../templates/emails'),
      extName: '.handlebars',
    }));

    console.log('Email transporter initialized with SMTP settings');
  } else {
    // For development without email config, use Ethereal (fake SMTP service)
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        console.error('Failed to create a testing account. ', err.message);
        return;
      }

      console.log('Ethereal email account created for testing');

      transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });

      // Configure handlebars for email templates
      transporter.use('compile', handlebars({
        viewEngine: {
          extName: '.handlebars',
          partialsDir: path.join(__dirname, '../templates/emails'),
          layoutsDir: path.join(__dirname, '../templates/emails/layouts'),
          defaultLayout: 'main',
        },
        viewPath: path.join(__dirname, '../templates/emails'),
        extName: '.handlebars',
      }));
    });
  }
};

// Generate a random OTP
const generateOTP = () => {
  return cryptoRandomString({
    length: 6,
    type: 'numeric',
  });
};

// Send verification email with OTP
const sendVerificationEmail = async (user, otp) => {
  try {
    if (!transporter) {
      console.log('Transporter not initialized, initializing now...');
      initTransporter();

      // Wait a bit for async initialization (for Ethereal)
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!transporter) {
      throw new Error('Email transporter could not be initialized');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"LinkBzaar" <noreply@linkbzaar.com>',
      to: user.email,
      subject: 'Email Verification - LinkBzaar',
      template: 'verification',
      context: {
        name: user.name,
        otp,
        expiryTime: '10 minutes',
      },
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Verification email sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    if (!transporter) {
      initTransporter();
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"LinkBzaar" <noreply@linkbzaar.com>',
      to: user.email,
      subject: 'Welcome to LinkBzaar!',
      template: 'welcome',
      context: {
        name: user.name,
        loginLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
      },
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Welcome email sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email with OTP
const sendPasswordResetEmail = async (user, otp) => {
  try {
    if (!transporter) {
      console.log('Transporter not initialized, initializing now...');
      initTransporter();

      // Wait a bit for async initialization (for Ethereal)
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!transporter) {
      throw new Error('Email transporter could not be initialized');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"LinkBzaar" <noreply@linkbzaar.com>',
      to: user.email,
      subject: 'Password Reset - LinkBzaar',
      template: 'password-reset',
      context: {
        name: user.name,
        otp,
        expiryTime: '10 minutes',
      },
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Password reset email sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  initTransporter,
  generateOTP,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
