const nodemailer = require('nodemailer');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `SUPVEND <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid or AWS SES
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // HTML email templates
    const html = this.getTemplate(template);
    
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: `Click here: ${this.url}`
    };

    await this.newTransport().sendMail(mailOptions);
  }

  getTemplate(template) {
    const templates = {
      verification: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to SUPVEND! 🎉</h2>
          <p>Hi ${this.firstName},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${this.url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
      passwordReset: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password 🔒</h2>
          <p>Hi ${this.firstName},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${this.url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p>This link expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };
    return templates[template];
  }

  async sendVerification() {
    await this.send('verification', 'Verify your email address');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Reset your password (expires in 10 minutes)');
  }
}

module.exports = Email;
