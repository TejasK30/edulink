export const attendanceTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attendance Alert</title>
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
    .alert {
      background-color: #fff0f0;
      border-left: 4px solid #cc0000;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .stats {
      background-color: #f7f7f7;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .progress-container {
      height: 20px;
      width: 100%;
      background-color: #e0e0e0;
      border-radius: 10px;
      margin: 10px 0;
    }
    .progress-bar {
      height: 100%;
      background-color: #4F46E5;
      border-radius: 10px;
      text-align: center;
      color: white;
      font-weight: bold;
      line-height: 20px;
      font-size: 12px;
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
      <h1>Attendance Alert</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      {{#if isWarning}}
      <div class="alert">
        <h3>⚠️ Attendance Warning</h3>
        <p>Your attendance for <strong>{{courseName}}</strong> has fallen below the required minimum level.</p>
      </div>
      {{else}}
      <p>This is a notification regarding your attendance for <strong>{{courseName}}</strong>.</p>
      {{/if}}
      <div class="stats">
        <h3>Attendance Statistics</h3>
        <p><strong>Course:</strong> {{courseName}} ({{courseCode}})</p>
        <p><strong>Current Attendance:</strong> {{attended}} out of {{total}} classes</p>
        <p><strong>Percentage:</strong> {{percentage}}%</p>
        <div class="progress-container">
          <div class="progress-bar" style="width: {{percentage}}%;">{{percentage}}%</div>
        </div>
        <p><strong>Required Minimum:</strong> {{requiredPercentage}}%</p>
        {{#if isWarning}}
        <p><strong>Classes needed to attend to meet minimum:</strong> {{classesNeeded}}</p>
        {{/if}}
      </div>
      <p>To view your full attendance record, please click the button below:</p>
      <div style="text-align: center;">
        <a href="{{attendanceUrl}}" class="button">View Attendance</a>
      </div>
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
