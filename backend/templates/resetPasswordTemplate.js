/**
 * Professional Fintech-Style Password Reset Email Template
 * Uses inline styles for maximum email client compatibility
 */

const getResetPasswordTemplate = (resetUrl, expiryMinutes = 60) => {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your NaijaPay Password</title>
  <style>
    /* Email client compatible styles */
    body, table, td, p { margin: 0; padding: 0; }
    body { width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    a { text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 24px !important; }
      .heading { font-size: 20px !important; }
      .button { width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="container" border="0" cellpadding="0" cellspacing="0" width="560" style="max-width:560px; width:100%;">
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#00C853,#00e676); border-radius:12px; padding:12px 20px;">
                    <span style="color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.5px;">Naija<span style="opacity:0.9;">Pay</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td class="content" style="background:#ffffff; border-radius:16px; padding:40px; box-shadow:0 4px 24px rgba(0,0,0,0.15);">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <!-- Icon -->
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:rgba(0,200,83,0.08); border-radius:50%; width:64px; height:64px; text-align:center; vertical-align:middle;">
                          <span style="font-size:28px;">&#128274;</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <h1 class="heading" style="color:#1a1a2e; font-size:24px; font-weight:700; line-height:1.3; margin:0;">Password Reset Request</h1>
                  </td>
                </tr>

                <!-- Subtext -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <p style="color:#64748b; font-size:15px; line-height:1.6; margin:0;">
                      You recently requested to reset your password for your NaijaPay account. Click the button below to securely reset it.
                    </p>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td class="button" align="center" style="background:linear-gradient(135deg,#00C853,#00e676); border-radius:10px; box-shadow:0 4px 12px rgba(0,200,83,0.3);">
                          <a href="${resetUrl}" style="display:inline-block; padding:16px 36px; color:#ffffff; font-size:15px; font-weight:700; text-decoration:none; border-radius:10px;">Reset My Password</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Fallback Link -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="color:#64748b; font-size:13px; line-height:1.6; text-align:center; margin:0 0 8px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; word-break:break-all;">
                          <a href="${resetUrl}" style="color:#00C853; font-size:12px; font-family:'Courier New',monospace; text-decoration:underline;">${resetUrl}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Expiry Notice -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="background:#fef3c7; border-left:4px solid #f59e0b; border-radius:0 8px 8px 0; padding:12px 16px;">
                          <p style="color:#92400e; font-size:13px; line-height:1.5; margin:0;">
                            <strong>⏱ Expires in ${expiryMinutes} minutes</strong><br>
                            This link will expire for security reasons. If it expires, please request a new reset.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Security Warning -->
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="background:#f0fdf4; border-left:4px solid #00C853; border-radius:0 8px 8px 0; padding:12px 16px;">
                          <p style="color:#166534; font-size:13px; line-height:1.5; margin:0;">
                            <strong>🔒 Security Notice</strong><br>
                            If you did not request this password reset, please ignore this email. Your account remains secure and no changes have been made.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px; padding-bottom:40px;">
              <p style="color:#94a3b8; font-size:12px; line-height:1.6; margin:0 0 6px 0;">
                &copy; ${year} NaijaPay. All rights reserved.
              </p>
              <p style="color:#64748b; font-size:12px; line-height:1.6; margin:0;">
                Nigeria's trusted platform for receiving international payments.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = { getResetPasswordTemplate };
