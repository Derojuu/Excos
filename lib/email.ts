import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

// Enhanced email styles to match the app's UI
const emailStyles = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      padding: 40px;
    }
    .message-box {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-left: 4px solid #3b82f6;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .response-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 4px solid #22c55e;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
      margin: 20px 0;
    }
    .button:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .highlight {
      color: #1d4ed8;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 24px 0;
    }
  </style>
`

// Password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  role: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
          <p>Exam Complaint System</p>
        </div>
        
        <div class="content">
          <h2>Hello <span class="highlight">${role.charAt(0).toUpperCase() + role.slice(1)}</span>,</h2>
          
          <p>We received a request to reset your password for your account. If you made this request, click the button below to set a new password:</p>
          
          <div class="message-box">
            <p style="margin: 0; font-weight: 600;">🔑 Reset your password to regain access to your account</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <div class="divider"></div>
          
          <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
          
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Security Tip:</strong> If you didn't request this, someone may be trying to access your account. Consider reviewing your account security.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2024 Exam Complaint System. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  await transporter.sendMail({
    from: `"Exam Complaint System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Reset Your Password - Exam Complaint System",
    html,
  })
}

// Response notification email
export async function sendResponseNotification(
  recipientEmail: string,
  complaintDetails: {
    examName: string,
    responseText: string,
    adminName: string,
    complaintId: string
  }
) {
  const viewLink = `${process.env.NEXT_PUBLIC_APP_URL}/complaints/${complaintDetails.complaintId}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Response to Your Complaint</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Response</h1>
          <p>Your complaint has been updated</p>
        </div>
        
        <div class="content">
          <h2>Great news! 🎉</h2>
          
          <p>Your complaint regarding <span class="highlight">${complaintDetails.examName}</span> has received a new response from our administrative team.</p>
          
          <div class="message-box">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span class="badge">Exam Details</span>
            </div>
            <p style="margin: 0; font-weight: 600; font-size: 16px;">${complaintDetails.examName}</p>
          </div>
          
          <div class="response-box">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">💬 ADMIN RESPONSE</span>
            </div>
            <p style="margin: 0; font-style: italic; font-size: 16px; line-height: 1.6;">"${complaintDetails.responseText}"</p>
            <div class="divider"></div>
            <p style="margin: 0; font-weight: 600; color: #059669;">
              📝 Response by: <span class="highlight">${complaintDetails.adminName}</span>
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${viewLink}" class="button">📋 View Full Complaint Details</a>
          </div>
          
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>💡 Next Steps:</strong> You can view the complete conversation, add additional information, or track the status of your complaint by clicking the button above.</p>
          </div>
          
          <div class="divider"></div>
          
          <p style="color: #6b7280; font-size: 14px;">Thank you for using our complaint system. We're committed to resolving your concerns promptly and fairly.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Exam Complaint System. All rights reserved.</p>
          <p>This notification was sent because you submitted a complaint. You cannot unsubscribe from system notifications.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  await transporter.sendMail({
    from: `"Exam Complaint System" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `💬 New Response: ${complaintDetails.examName} Complaint Update`,
    html,
  })
}

// Complaint submission confirmation email
export async function sendComplaintConfirmation(
  recipientEmail: string,
  complaintDetails: {
    referenceNumber: string,
    examName: string,
    studentName: string,
    submissionDate: string
  }
) {
  const trackingLink = `${process.env.NEXT_PUBLIC_APP_URL}/track-complaint`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complaint Submitted Successfully</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Complaint Submitted</h1>
          <p>We've received your submission</p>
        </div>
        
        <div class="content">
          <h2>Hello ${complaintDetails.studentName},</h2>
          
          <p>Your exam complaint has been successfully submitted to our system. We take all complaints seriously and will review your case thoroughly.</p>
          
          <div class="message-box">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span class="badge">Reference Number</span>
            </div>
            <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #1d4ed8;">${complaintDetails.referenceNumber}</p>
          </div>
          
          <div class="response-box">
            <h3 style="margin-top: 0; color: #059669;">📋 Complaint Details</h3>
            <p><strong>Exam:</strong> ${complaintDetails.examName}</p>
            <p><strong>Submitted:</strong> ${complaintDetails.submissionDate}</p>
            <p><strong>Status:</strong> <span style="background: #fbbf24; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">PENDING REVIEW</span></p>
          </div>
          
          <div style="text-align: center;">
            <a href="${trackingLink}" class="button">🔍 Track Your Complaint</a>
          </div>
          
          <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0c4a6e;"><strong>📞 What happens next?</strong></p>
            <ul style="margin: 10px 0 0 0; color: #0c4a6e;">
              <li>Our team will review your complaint within 2-3 business days</li>
              <li>You'll receive email updates on any status changes</li>
              <li>You can track progress using your reference number</li>
              <li>We may contact you if additional information is needed</li>
            </ul>
          </div>
          
          <div class="divider"></div>
          
          <p style="color: #6b7280; font-size: 14px;"><strong>Important:</strong> Please save your reference number and keep this email for your records.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Exam Complaint System. All rights reserved.</p>
          <p>Need help? Contact our support team with your reference number.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  await transporter.sendMail({
    from: `"Exam Complaint System" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `✅ Complaint Submitted - Reference: ${complaintDetails.referenceNumber}`,
    html,
  })
}