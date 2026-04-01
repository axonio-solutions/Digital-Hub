/**
 * Professional Email Template Engine for Digital Hub
 * Uses a robust, table-based layout for maximum email client compatibility.
 */

interface BaseLayoutProps {
  title: string
  content: string
  ctaText?: string
  ctaUrl?: string
}

const BRAND_COLOR = '#0f172a' // Slate 900
const ACCENT_COLOR = '#10b981' // Emerald 500
const BG_COLOR = '#f8fafc' // Slate 50
const TEXT_COLOR = '#334155' // Slate 700

export function renderBaseLayout({ title, content, ctaText, ctaUrl }: BaseLayoutProps) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: ${BG_COLOR};
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      width: 100% !important;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background-color: ${BRAND_COLOR};
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.025em;
      text-transform: uppercase;
      text-decoration: none;
    }
    .content {
      padding: 40px 32px;
      color: ${TEXT_COLOR};
      line-height: 1.6;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: ${BRAND_COLOR};
      margin-bottom: 24px;
    }
    .message {
      font-size: 16px;
      margin-bottom: 32px;
    }
    .button-container {
      text-align: center;
      margin-top: 32px;
    }
    .button {
      display: inline-block;
      background-color: ${ACCENT_COLOR};
      color: #ffffff !important;
      padding: 14px 28px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background-color 0.2s;
    }
    .footer {
      padding: 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      background-color: #f1f5f9;
    }
    .footer a {
      color: #64748b;
      text-decoration: underline;
    }
    @media (max-width: 640px) {
      .container {
        margin: 0;
        border-radius: 0;
        width: 100% !important;
      }
      .content {
        padding: 32px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://digital-hub.app" class="logo">Digital Hub</a>
    </div>
    <div class="content">
      <div class="title">${title}</div>
      <div class="message">${content}</div>
      ${ctaText && ctaUrl ? `
      <div class="button-container">
        <a href="${ctaUrl}" class="button">${ctaText}</a>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Digital Hub Marketplace. All rights reserved.</p>
      <p>
        <a href="https://digital-hub.app/dashboard/settings">Manage Preferences</a> &bull; 
        <a href="https://digital-hub.app/support">Help Center</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
