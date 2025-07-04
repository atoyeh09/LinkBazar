const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config();

console.log('Testing email configuration...');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***hidden***' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

async function testEmail() {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log('\nTesting SMTP connection...');

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    const testEmail = {
      from: process.env.EMAIL_FROM || '"LinkBzaar" <noreply@linkbzaar.com>',
      to: process.env.EMAIL_USER, // Send to same email for testing
      subject: 'Test Email - LinkBzaar',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify your email configuration is working.</p>
        <p>If you received this email, your SMTP settings are correct!</p>
        <p>Test OTP: <strong>123456</strong></p>
      `
    };

    console.log('\nSending test email...');
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);

    if (error.code === 'EAUTH') {
      console.error('\n🔑 Authentication failed. Please check:');
      console.error('1. Your email and password are correct');
      console.error('2. If using Gmail, make sure you\'re using an App Password, not your regular password');
      console.error('3. 2-Factor Authentication is enabled on your Google account');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 Connection failed. Please check:');
      console.error('1. Your internet connection');
      console.error('2. SMTP host and port settings');
      console.error('3. Firewall settings');
    }

    console.error('\nFull error details:', error);
  }
}

testEmail();
