export const feedbackConfirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Thank You for Your Feedback</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #10B981;
      color: white;
      padding: 20px;
      border-radius: 6px 6px 0 0;
      text-align: center;
    }
    .content {
      padding: 20px;
    }
    .feedback-box {
      background-color: #f0fdf4;
      border-left: 4px solid #10B981;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      color: #888;
      font-size: 14px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Feedback Received!</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>Thank you for submitting your feedback{{#if teacher}} for <strong>{{teacher}}</strong>{{/if}}. We truly value your input!</p>

      <div class="feedback-box">
        <p><strong>Your Rating:</strong> {{rating}} / 5</p>
        {{#if comment}}
          <p><strong>Your Comment:</strong></p>
          <p>{{comment}}</p>
        {{/if}}
      </div>

      <p>We constantly strive to improve and your feedback helps us make EduLink better for everyone.</p>

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
