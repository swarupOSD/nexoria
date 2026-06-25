export const getBaseTemplate = (title, content, actionUrl, actionText) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
  .header { background: #4f46e5; padding: 32px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
  .content { padding: 40px; color: #334155; line-height: 1.6; font-size: 16px; }
  .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-top: 24px; }
  .footer { background: #f1f5f9; padding: 24px; text-align: center; color: #64748b; font-size: 13px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
      ${actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="btn">${actionText}</a></div>` : ''}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Premium Apps. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

export const getTicketReplyTemplate = (userName, subject, replyContent, ticketUrl) => {
  const content = `
    <p>Hi ${userName},</p>
    <p>Our support team has replied to your ticket regarding "<strong>${subject}</strong>".</p>
    <div style="background: #f8fafc; padding: 16px; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0; margin: 20px 0;">
      <p style="margin: 0; font-style: italic; color: #475569;">"${replyContent}"</p>
    </div>
    <p>Please click the button below to view the full conversation or reply.</p>
  `;
  return getBaseTemplate('Support Ticket Update', content, ticketUrl, 'View Ticket');
};

export const getPremiumApprovedTemplate = (userName, planName, actionUrl) => {
  const content = `
    <p>Hi ${userName},</p>
    <p>Great news! Your payment for the <strong>${planName}</strong> plan has been approved.</p>
    <p>Your account is now fully upgraded. You can start enjoying all the premium benefits immediately.</p>
  `;
  return getBaseTemplate('Premium Membership Activated', content, actionUrl, 'Go to Dashboard');
};

export const getPurchaseApprovedTemplate = (userName, appName, actionUrl) => {
  const content = `
    <p>Hi ${userName},</p>
    <p>Your purchase of <strong>${appName}</strong> has been confirmed and approved!</p>
    <p>The app is now available in your Downloads section.</p>
  `;
  return getBaseTemplate('Purchase Approved', content, actionUrl, 'Download Now');
};

export const getWelcomeTemplate = (userName, actionUrl) => {
  const content = `
    <p>Welcome to the platform, ${userName}!</p>
    <p>We're thrilled to have you here. Discover amazing premium apps, read reviews, and explore exclusive content.</p>
  `;
  return getBaseTemplate('Welcome to Premium Apps', content, actionUrl, 'Explore Apps');
};

export const getPasswordResetTemplate = (userName, resetUrl) => {
  const content = `
    <p>Hi ${userName},</p>
    <p>We received a request to reset your password. Click the button below to set a new password.</p>
    <p style="color: #ef4444; font-size: 14px;">This link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
  `;
  return getBaseTemplate('Password Reset Request', content, resetUrl, 'Reset Password');
};
