export const verificationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your EduLink Account</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #4F46E5;
      color: white;
      border-radius: 6px 6px 0 0;
    }
    .content {
      padding: 20px;
    }
    .verification-code {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      text-align: center;
      padding: 15px;
      margin: 20px 0;
      background-color: #f0f0f0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
      color: #777777;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Thank you for registering with EduLink. To complete your registration and activate your account, please verify your email address.</p>
      <p>Please click the button below to verify your email address:</p>
      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
      </div>
      <p>Or use this verification code:</p>
      <div class="verification-code">{{verificationCode}}</div>
      <p>This verification code will expire in {{expiryTime}} minutes.</p>
      <p>If you didn't create an account on EduLink, you can safely ignore this email.</p>
      <p>Best regards,<br>The EduLink Team</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} EduLink. All rights reserved.</p>
      <p>This email was sent to {{email}}</p>
    </div>
  </div>
</body>
</html>
`
