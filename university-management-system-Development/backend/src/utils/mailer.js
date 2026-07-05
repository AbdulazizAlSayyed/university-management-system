const nodemailer = require('nodemailer');

// One transporter reused across the app, authenticated with a Gmail App Password
// (never a normal Gmail password) via EMAIL_USER / EMAIL_PASS in .env.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends a new user their university login credentials.
 */
async function sendCredentialsEmail({ to, firstName, universityEmail, password, role }) {
  const subject = 'Your UniHub account is ready';
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Welcome to UniHub, ${firstName}!</h2>
      <p>Your ${role} account has been created. Use the credentials below to sign in:</p>
      <table style="margin: 16px 0; border-collapse: collapse;">
        <tr><td style="padding:4px 8px;"><strong>University email</strong></td><td style="padding:4px 8px;">${universityEmail}</td></tr>
        <tr><td style="padding:4px 8px;"><strong>Password</strong></td><td style="padding:4px 8px;">${password}</td></tr>
      </table>
      <p>Please log in and change your password as soon as possible.</p>
      <p><a href="${process.env.CLIENT_URL}/login">Go to login</a></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"UniHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

/**
 * Sends a password reset link.
 */
async function sendResetEmail({ to, resetLink }) {
  await transporter.sendMail({
    from: `"UniHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your UniHub password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Password reset requested</h2>
        <p>Click the link below to set a new password. This link expires in 30 minutes.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `
  });
}

module.exports = { sendCredentialsEmail, sendResetEmail };
