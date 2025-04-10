export const announcementTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Announcement</title>
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
    .announcement {
      background-color: #f0f7ff;
      border-left: 4px solid #0066cc;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
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
    .priority-high {
      color: #cc0000;
      font-weight: bold;
    }
    .priority-medium {
      color: #ff9900;
      font-weight: bold;
    }
    .priority-low {
      color: #009900;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Announcement</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>A new announcement has been posted{{#if department}} for the {{department}} department{{/if}}{{#if course}} in {{course}}{{/if}}.</p>
      <div class="announcement">
        <h3>{{title}}</h3>
        <p><strong>Posted by:</strong> {{postedBy}}</p>
        <p><strong>Date:</strong> {{formatDate date}}</p>
        <p><strong>Priority:</strong> 
          <span class="priority-{{priority}}">
            {{#ifEquals priority "high"}}High - Important{{/ifEquals}}
            {{#ifEquals priority "medium"}}Medium{{/ifEquals}}
            {{#ifEquals priority "low"}}Low{{/ifEquals}}
          </span>
        </p>
        <p>{{message}}</p>
      </div>
      <p>To view all announcements, please click the button below:</p>
      <div style="text-align: center;">
        <a href="{{announcementsUrl}}" class="button">View Announcements</a>
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
