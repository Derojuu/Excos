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

// Password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
  role: string
) {
  const html = `<h2>Reset Your Password</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>`
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
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
  const html = `<h2>New Response to Your Complaint</h2>
    <p>Your complaint regarding <strong>${complaintDetails.examName}</strong> has received a new response.</p>
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #4b5563; font-style: italic;">${complaintDetails.responseText}</p>
    </div>
    <p>Response by: <strong>${complaintDetails.adminName}</strong></p>
    <a href="${viewLink}">View Complaint Details</a>`
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `New Response to Your ${complaintDetails.examName} Complaint`,
    html,
  })
}