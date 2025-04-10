export const assignmentTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Assignment</title>
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
    .assignment {
      background-color: #f0f7ff;
      border-left: 4px solid #0066cc;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .deadline {
      background-color: #fff8e6;
      border: 1px solid #ffd166;
      padding: 10px;
      margin: 15px 0;
      border-radius: 4px;
      font-weight: bold;
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
      <h1>New Assignment</h1>
    </div>
    <div class="content">
      <h2>Hello {{name}},</h2>
      <p>A new assignment has been posted for your course: <strong>{{courseName}}</strong>.</p>
      <div class="assignment">
        <h3>{{title}}</h3>
        <p><strong>Course:</strong> {{courseName}} ({{courseCode}})</p>
        <p><strong>Posted by:</strong> {{teacher}}</p>
        <p><strong>Total Marks:</strong> {{totalMarks}}</p>
        <div class="deadline">
          <p>Deadline: {{formatDate dueDate}} at {{formatTime dueDate}}</p>
        </div>
        <p><strong>Description:</strong></p>
        <p>{{description}}</p>
      </div>
      <p>To view assignment details and submit your work, please click the button below:</p>
      <div style="text-align: center;">
        <a href="{{assignmentUrl}}" class="button">View Assignment</a>
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
