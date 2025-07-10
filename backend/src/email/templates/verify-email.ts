export const otpVerificationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Verification</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #4F46E5;
      color: #ffffff;
      border-radius: 6px 6px 0 0;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .otp-box {
      display: inline-block;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 6px;
      padding: 12px 24px;
      background-color: #f0f0ff;
      color: #4F46E5;
      border: 2px dashed #4F46E5;
      border-radius: 8px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #777;
      margin-top: 30px;
      border-top: 1px solid #e0e0e0;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Verification</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>To verify your email address, please use the One-Time Password (OTP) below:</p>

      <div class="otp-box">{{otp}}</div>

      <p>This OTP is valid for <strong>{{expiresIn}} minutes</strong>.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>

      <p>Thanks,<br>The EduLink Team</p>
    </div>
    <div class="footer">
      <p>&copy; {{year}} EduLink. All rights reserved.</p>
      <p>This email was sent to {{email}}</p>
    </div>
  </div>
</body>
</html>
`
