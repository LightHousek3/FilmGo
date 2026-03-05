const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../config/logger');

// ─── Transporter ─────────────────────────────────────────────────────────────
const createTransporter = () => {
    return nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.port === 465,
        auth: {
            user: config.email.smtp.auth.user,
            pass: config.email.smtp.auth.pass,
        },
    });
};

// ─── Base Layout ─────────────────────────────────────────────────────────────
const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FilmGo</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #0a0a14; font-family: 'Montserrat', Arial, sans-serif; }
    a { text-decoration: none; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; border-radius:16px; overflow:hidden; border: 1px solid #1e1e30;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a0533 0%, #0d0d1f 60%, #1a0d33 100%); padding: 32px 40px; text-align:center;">
              <!-- Film strip decoration -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        ${Array(8).fill('<td style="width:12px; height:10px; background:#f5a623; border-radius:2px; margin:0 3px;"></td><td style="width:6px;"></td>').join('')}
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <div style="display:inline-block;">
                      <span style="font-size:36px; font-weight:800; letter-spacing:-1px; color:#ffffff;">
                        🎬 <span style="color:#f5a623;">Film</span><span style="color:#e040fb;">Go</span>
                      </span>
                    </div>
                    <p style="color:#8888aa; font-size:12px; letter-spacing:4px; text-transform:uppercase; margin-top:6px;">Cinema Ticket Booking</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        ${Array(8).fill('<td style="width:12px; height:10px; background:#f5a623; border-radius:2px; margin:0 3px;"></td><td style="width:6px;"></td>').join('')}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CONTENT ── -->
          <tr>
            <td style="background:#12121f; padding: 40px 48px;">
              ${content}
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:#0d0d1a; padding: 24px 40px; text-align:center; border-top:1px solid #1e1e30;">
              <p style="color:#555570; font-size:12px; line-height:1.6;">
                © ${new Date().getFullYear()} <span style="color:#f5a623; font-weight:600;">FilmGo</span>. All rights reserved.<br/>
                This is an automated message. Please do not reply to this email.
              </p>
              <p style="margin-top:12px;">
                <span style="display:inline-block; width:6px; height:6px; background:#f5a623; border-radius:50%; margin:0 4px;"></span>
                <span style="display:inline-block; width:6px; height:6px; background:#e040fb; border-radius:50%; margin:0 4px;"></span>
                <span style="display:inline-block; width:6px; height:6px; background:#f5a623; border-radius:50%; margin:0 4px;"></span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Email Verification Template ─────────────────────────────────────────────
const verificationEmailTemplate = ({ firstName, verificationUrl, expiresInHours = 24 }) => {
    const content = `
      <!-- Greeting -->
      <h2 style="color:#ffffff; font-size:22px; font-weight:700; margin-bottom:8px;">
        Welcome to FilmGo, <span style="color:#f5a623;">${firstName}</span>! 🎉
      </h2>
      <p style="color:#8888aa; font-size:14px; margin-bottom:28px;">
        You're just one step away from experiencing the best cinema booking service.
      </p>

      <!-- Message box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#1a1a2e; border-left:4px solid #f5a623; border-radius:8px; padding:20px 24px;">
            <p style="color:#ccccdd; font-size:14px; line-height:1.7;">
              Please verify your email address to activate your account. Click the button below to confirm your email.
              This link will expire in <strong style="color:#f5a623;">${expiresInHours} hours</strong>.
            </p>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <a href="${verificationUrl}"
               style="display:inline-block; background: linear-gradient(135deg, #f5a623, #e08000);
                      color:#000000; font-weight:700; font-size:15px; letter-spacing:0.5px;
                      padding:16px 48px; border-radius:50px; text-decoration:none;
                      box-shadow: 0 4px 20px rgba(245,166,35,0.4);">
              ✉️ &nbsp; Verify My Email
            </a>
          </td>
        </tr>
      </table>

      <!-- Fallback link -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#0f0f1c; border-radius:8px; padding:16px 20px;">
            <p style="color:#666680; font-size:12px; margin-bottom:8px;">Or copy and paste this link into your browser:</p>
            <p style="color:#e040fb; font-size:12px; word-break:break-all; font-family: monospace;">
              ${verificationUrl}
            </p>
          </td>
        </tr>
      </table>

      <!-- What's next -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="color:#8888aa; font-size:13px; line-height:1.7;">
              🎟️ &nbsp;After verification, you can:<br/>
              &nbsp;&nbsp;&nbsp;• Browse latest movies & showtimes<br/>
              &nbsp;&nbsp;&nbsp;• Book tickets online in seconds<br/>
              &nbsp;&nbsp;&nbsp;• Enjoy exclusive member deals<br/>
            </p>
          </td>
        </tr>
      </table>

      <hr style="border:none; border-top:1px solid #1e1e30; margin: 28px 0;"/>

      <p style="color:#555570; font-size:12px; line-height:1.6;">
        If you didn't create a FilmGo account, you can safely ignore this email.<br/>
        For support, please contact us at <span style="color:#f5a623;">support@filmgo.vn</span>
      </p>
    `;
    return baseLayout(content);
};

// ─── Forgot Password Template ─────────────────────────────────────────────────
const forgotPasswordTemplate = ({ firstName, resetUrl, expiresInMinutes = 60 }) => {
    const content = `
      <!-- Header icon -->
      <div style="text-align:center; margin-bottom:24px;">
        <div style="display:inline-block; background:#1a0533; border-radius:50%; width:72px; height:72px; line-height:72px; text-align:center; font-size:32px; border:2px solid #e040fb;">
          🔐
        </div>
      </div>

      <!-- Greeting -->
      <h2 style="color:#ffffff; font-size:22px; font-weight:700; text-align:center; margin-bottom:8px;">
        Password Reset Request
      </h2>
      <p style="color:#8888aa; font-size:14px; text-align:center; margin-bottom:28px;">
        Hi <span style="color:#f5a623; font-weight:600;">${firstName}</span>, we received a request to reset your password.
      </p>

      <!-- Alert box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#1a1a2e; border-left:4px solid #e040fb; border-radius:8px; padding:20px 24px;">
            <p style="color:#ccccdd; font-size:14px; line-height:1.7;">
              Click the button below to reset your password. This link will expire in
              <strong style="color:#e040fb;">${expiresInMinutes} minutes</strong>.
              If you didn't request this, please ignore this email — your password will remain unchanged.
            </p>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td align="center">
            <a href="${resetUrl}"
               style="display:inline-block; background: linear-gradient(135deg, #e040fb, #9c00cc);
                      color:#ffffff; font-weight:700; font-size:15px; letter-spacing:0.5px;
                      padding:16px 48px; border-radius:50px; text-decoration:none;
                      box-shadow: 0 4px 20px rgba(224,64,251,0.4);">
              🔑 &nbsp; Reset My Password
            </a>
          </td>
        </tr>
      </table>

      <!-- Fallback link -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#0f0f1c; border-radius:8px; padding:16px 20px;">
            <p style="color:#666680; font-size:12px; margin-bottom:8px;">Or copy and paste this link into your browser:</p>
            <p style="color:#e040fb; font-size:12px; word-break:break-all; font-family: monospace;">
              ${resetUrl}
            </p>
          </td>
        </tr>
      </table>

      <!-- Security notice -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#1a0d1a; border-radius:8px; padding:16px 20px;">
            <p style="color:#888899; font-size:12px; line-height:1.7;">
              🛡️ <strong style="color:#e040fb;">Security Notice:</strong><br/>
              &nbsp;&nbsp;• This link expires in ${expiresInMinutes} minutes<br/>
              &nbsp;&nbsp;• Never share this link with anyone<br/>
              &nbsp;&nbsp;• FilmGo staff will never ask for your password<br/>
              &nbsp;&nbsp;• If you didn't request this, check your account for unauthorized access
            </p>
          </td>
        </tr>
      </table>

      <hr style="border:none; border-top:1px solid #1e1e30; margin: 28px 0;"/>

      <p style="color:#555570; font-size:12px; line-height:1.6; text-align:center;">
        For support, please contact us at <span style="color:#f5a623;">support@filmgo.vn</span>
      </p>
    `;
    return baseLayout(content);
};

// ─── Password Changed Confirmation Template ───────────────────────────────────
const passwordChangedTemplate = ({ firstName }) => {
    const content = `
      <!-- Header icon -->
      <div style="text-align:center; margin-bottom:24px;">
        <div style="display:inline-block; background:#0c1a0c; border-radius:50%; width:72px; height:72px; line-height:72px; text-align:center; font-size:32px; border:2px solid #4caf50;">
          ✅
        </div>
      </div>

      <h2 style="color:#ffffff; font-size:22px; font-weight:700; text-align:center; margin-bottom:8px;">
        Password Changed Successfully
      </h2>
      <p style="color:#8888aa; font-size:14px; text-align:center; margin-bottom:28px;">
        Hi <span style="color:#f5a623; font-weight:600;">${firstName}</span>, your FilmGo account password has been updated.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#0c1a0c; border-left:4px solid #4caf50; border-radius:8px; padding:20px 24px;">
            <p style="color:#ccccdd; font-size:14px; line-height:1.7;">
              Your password was successfully changed. You can now log in with your new password.
              If you did not make this change, please contact our support team immediately.
            </p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="background:#1a0d1a; border-radius:8px; padding:16px 20px;">
            <p style="color:#888899; font-size:12px; line-height:1.7;">
              🛡️ <strong style="color:#4caf50;">If this was NOT you:</strong><br/>
              &nbsp;&nbsp;• Immediately contact us at <span style="color:#f5a623;">support@filmgo.vn</span><br/>
              &nbsp;&nbsp;• We'll help you secure your account right away
            </p>
          </td>
        </tr>
      </table>

      <hr style="border:none; border-top:1px solid #1e1e30; margin: 28px 0;"/>
      <p style="color:#555570; font-size:12px; line-height:1.6; text-align:center;">
        © ${new Date().getFullYear()} FilmGo — Cinema Ticket Booking
      </p>
    `;
    return baseLayout(content);
};

// ─── Send Email (core) ────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: `"FilmGo 🎬" <${config.email.from}>`,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Failed to send email to ${to}: ${error.message}`);
        throw error;
    }
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send email verification link
 */
const sendVerificationEmail = async ({ to, firstName, verificationUrl }) => {
    await sendEmail({
        to,
        subject: '🎬 FilmGo — Verify Your Email Address',
        html: verificationEmailTemplate({ firstName, verificationUrl }),
    });
};

/**
 * Send forgot password reset link
 */
const sendForgotPasswordEmail = async ({ to, firstName, resetUrl }) => {
    await sendEmail({
        to,
        subject: '🔐 FilmGo — Password Reset Request',
        html: forgotPasswordTemplate({ firstName, resetUrl }),
    });
};

/**
 * Send password changed confirmation
 */
const sendPasswordChangedEmail = async ({ to, firstName }) => {
    await sendEmail({
        to,
        subject: '✅ FilmGo — Your Password Has Been Changed',
        html: passwordChangedTemplate({ firstName }),
    });
};

module.exports = {
    sendVerificationEmail,
    sendForgotPasswordEmail,
    sendPasswordChangedEmail,
};
