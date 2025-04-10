export const welcomeTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EduLink</title>
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
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 10px;
    }
    .content {
      padding: 20px;
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
      <h1>Welcome to EduLink!</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>Welcome to EduLink, your all-in-one college management platform. We're excited to have you join our community as a {{role}}!</p>
      <p>Your account has been successfully created, and you can now access all the features and resources available to you.</p>
      <p>Here's what you need to know:</p>
      <ul>
        <li>Your username: <strong>{{username}}</strong></li>
        <li>Your role: <strong>{{role}}</strong></li>
        <li>Your college: <strong>{{college}}</strong></li>
      </ul>
      <p>To get started, click the button below to login to your account:</p>
      <div style="text-align: center;">
        <a href="{{loginUrl}}" class="button">Login to EduLink</a>
      </div>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
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
