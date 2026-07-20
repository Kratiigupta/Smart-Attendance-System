// Email Service - Nodemailer with Ethereal fallback

let transporter: any = null;

const initNodemailer = async () => {
  if (transporter) return transporter;
  try {
    const nodemailer = await import('nodemailer');
    const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      transporter = nodemailer.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    } else {
      // Create a test account on Ethereal if no real credentials are provided
      console.log('📬 No SMTP credentials provided, creating Ethereal test account...');
      const testAccount = await nodemailer.default.createTestAccount();
      transporter = nodemailer.default.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`✉️ Ethereal SMTP initialized. User: ${testAccount.user}`);
    }
    return transporter;
  } catch (error) {
    console.warn('⚠️ Nodemailer is not available or failed to initialize. Falling back to console logging.', error);
    return null;
  }
};

export const sendOTPEmail = async (to: string, otp: string, purpose: string) => {
  const subject = `SmartEdu Campus OTP Verification: ${otp}`;
  const text = `Your verification code is: ${otp}. It will expire in 5 minutes. Purpose: ${purpose}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6366f1; text-align: center;">SmartEdu Security</h2>
      <p>Hello,</p>
      <p>You requested a verification code for <strong>${purpose}</strong>.</p>
      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #666; font-size: 12px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
    </div>
  `;

  const client = await initNodemailer();
  if (client) {
    try {
      const info = await client.sendMail({
        from: process.env.SMTP_FROM || '"SmartEdu Security" <security@smartedu.campus>',
        to,
        subject,
        text,
        html
      });
      console.log(`📧 OTP Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      
      // If using Ethereal, log the preview URL
      const nodemailer = await import('nodemailer');
      const previewUrl = nodemailer.default.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`✉️ Ethereal Preview URL: ${previewUrl}`);
      }
      return { sent: true, previewUrl };
    } catch (err) {
      console.error('❌ Failed to send email via SMTP:', err);
    }
  }

  // Fallback console log
  console.log('\n====================================');
  console.log(`📨 [FALLBACK EMAIL LOG] To: ${to}`);
  console.log(`🔑 OTP Code: ${otp}`);
  console.log(`📝 Purpose: ${purpose}`);
  console.log('====================================\n');
  return { sent: false };
};
