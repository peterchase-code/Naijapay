/**
 * Reusable Email Base Template
 * NigeriaPay branded | Responsive | Fintech style
 * All notification emails extend this layout.
 */

const getEmailBase = ({ title, headline, bodyHtml, ctaText, ctaUrl, noteHtml, accentColor }) => {
  const brandColor = accentColor || '#00C853';
  const brandDark = '#1A237E';
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - NigeriaPay</title>
  <style>
    body,table,td,p{margin:0;padding:0}
    body{width:100%!important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table{border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
    a{text-decoration:none}
    @media only screen and (max-width:600px){
      .container{width:100%!important;padding:16px!important}
      .content{padding:24px!important}
      .heading{font-size:20px!important}
      .button{width:100%!important;text-align:center!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" class="container" border="0" cellpadding="0" cellspacing="0" width="540" style="max-width:540px;width:100%;">

        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:24px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr><td style="background:linear-gradient(135deg,${brandColor},#00e676);border-radius:12px;padding:12px 22px;">
              <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">Nigeria<span style="opacity:0.85;">Pay</span></span>
            </td></tr>
          </table>
        </td></tr>

        <!-- Main Card -->
        <tr><td class="content" style="background:#ffffff;border-radius:16px;padding:36px;box-shadow:0 4px 24px rgba(0,0,0,0.15);">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">

            <!-- Status Accent Bar -->
            <tr><td style="padding-bottom:20px;">
              <div style="width:48px;height:4px;border-radius:2px;background:linear-gradient(90deg,${brandColor},${brandDark});"></div>
            </td></tr>

            <!-- Headline -->
            <tr><td style="padding-bottom:16px;">
              <h1 class="heading" style="color:#1a1a2e;font-size:22px;font-weight:700;line-height:1.3;margin:0;">${headline}</h1>
            </td></tr>

            <!-- Body -->
            <tr><td style="padding-bottom:24px;">
              <div style="color:#475569;font-size:15px;line-height:1.7;">${bodyHtml}</div>
            </td></tr>

            ${ctaText && ctaUrl ? `
            <!-- CTA Button -->
            <tr><td align="center" style="padding-bottom:24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr><td class="button" align="center" style="background:linear-gradient(135deg,${brandColor},${brandDark});border-radius:10px;box-shadow:0 4px 16px ${brandColor}40;">
                  <a href="${ctaUrl}" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;border-radius:10px;">${ctaText}</a>
                </td></tr>
              </table>
            </td></tr>
            ` : ''}

            ${noteHtml ? `
            <!-- Note Box -->
            <tr><td style="padding-bottom:8px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid ${brandColor};border-radius:0 8px 8px 0;padding:14px 16px;">
                  <div style="color:#475569;font-size:13px;line-height:1.6;">${noteHtml}</div>
                </td></tr>
              </table>
            </td></tr>
            ` : ''}

            <!-- Security Footer -->
            <tr><td style="padding-top:16px;">
              <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;text-align:center;">
                If you did not initiate this action, please contact our support team immediately. Your account security is our priority.
              </p>
            </td></tr>

          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;padding-bottom:32px;">
          <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0 0 4px 0;">NigeriaPay &mdash; Trusted International Payments</p>
          <p style="color:#475569;font-size:12px;margin:0;">&copy; ${year} NigeriaPay. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

/**
 * Format NGN amount
 */
const formatNGN = (amount) => {
  const num = parseFloat(amount) || 0;
  return '\u20A6' + num.toLocaleString('en-NG');
};

module.exports = { getEmailBase, formatNGN };
