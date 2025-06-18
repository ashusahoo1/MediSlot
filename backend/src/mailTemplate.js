const registrationEmailHTML = (username = "there!") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Our Platform</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f7;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 6px;
      padding: 30px;
      max-width: 600px;
      margin: auto;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      color: #333333;
    }
    .content {
      margin-top: 20px;
      color: #555555;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      margin-top: 30px;
      padding: 12px 24px;
      background-color: #007bff;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      text-align: center;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 class="header">Welcome to MediSlot 🎉</h2>
    <div class="content">
      <p>Hi ${username},</p>
      <p>Thank you for registering with us! We're thrilled to have you on board.</p>
      <p>You can now explore all our features, and make the most out of your experience.</p>
      <p>If you have any questions or need help, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      &copy; 2025 MediSlot. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

export{
    registrationEmailHTML
}