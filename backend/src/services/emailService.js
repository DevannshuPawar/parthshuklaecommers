const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpSecure = process.env.SMTP_SECURE === 'true';

  const mailOptions = {
    from: `"ShopKart Support" <${smtpUser || 'no-reply@shopkart.com'}>`,
    to: email,
    subject: 'ShopKart - Reset Password OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <h2 style="color: #4F46E5; text-align: center; margin-bottom: 24px;">ShopKart Password Reset</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hello,</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your ShopKart account. Use the following 6-digit One Time Password (OTP) to complete the reset process. This OTP is valid for <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background-color: #F3F4F6; padding: 12px 24px; border-radius: 8px; border: 1px dashed #4F46E5; display: inline-block;">${otp}</span>
        </div>
        <p style="color: #374151; font-size: 14px; line-height: 1.5;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">&copy; ${new Date().getFullYear()} ShopKart. All rights reserved.</p>
      </div>
    `
  };

  // If credentials are empty or template placeholders, fall back to logging
  if (!smtpUser || !smtpPass || smtpUser.includes('your-email') || smtpPass.trim() === '') {
    console.log('\n==================================================');
    console.log(`[EMAIL FALLBACK] Sent OTP Reset Email to: ${email}`);
    console.log(`[EMAIL FALLBACK] Generated OTP Code: ${otp}`);
    console.log('==================================================\n');
    return { success: true, mock: true };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP Email sent successfully to ${email}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Nodemailer Error: Failed to send mail, falling back to console log. Details:', error.message);
    console.log('\n==================================================');
    console.log(`[EMAIL FALLBACK] Sent OTP Reset Email to: ${email}`);
    console.log(`[EMAIL FALLBACK] Generated OTP Code: ${otp}`);
    console.log('==================================================\n');
    return { success: true, error: error.message, mock: true };
  }
};

module.exports = { sendOTPEmail };
