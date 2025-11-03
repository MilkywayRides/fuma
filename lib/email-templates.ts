export function getOTPEmailTemplate(otp: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #18181b; font-size: 24px; font-weight: 600;">Verify Your Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px 40px; color: #52525b; font-size: 16px; line-height: 24px;">
              <p style="margin: 0 0 20px 0;">Use the verification code below to complete your email verification:</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px;" align="center">
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; display: inline-block;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #18181b;">${otp}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px 40px; color: #71717a; font-size: 14px; line-height: 20px;">
              <p style="margin: 0;">This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} BlazeNeuro. All rights reserved.
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
}

export function getMagicLinkEmailTemplate(magicLink: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #18181b; font-size: 24px; font-weight: 600;">Verify Your Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px; color: #52525b; font-size: 16px; line-height: 24px;">
              <p style="margin: 0 0 20px 0;">Click the button below to verify your email address and complete your registration:</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px;" align="center">
              <a href="${magicLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">Verify Email</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px 40px; color: #71717a; font-size: 14px; line-height: 20px;">
              <p style="margin: 0 0 10px 0;">Or copy and paste this link into your browser:</p>
              <p style="margin: 0; word-break: break-all; color: #3b82f6;">${magicLink}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 20px 40px; color: #71717a; font-size: 14px; line-height: 20px;">
              <p style="margin: 0;">This link will expire in 1 hour. If you didn't request this email, please ignore it.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} BlazeNeuro. All rights reserved.
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
}
