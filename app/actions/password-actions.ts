"use server"

import { getDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { sendPasswordResetEmail } from "@/lib/email"
import bcryptjs from "bcryptjs"

// Generate a reset token and store it in the database
export async function requestPasswordReset(email: string, role: string) {
  try {
    const db = await getDb()
    
    // All users are now in the users table with a role field
    const [userRows] = await db.execute(
      'SELECT id, email FROM users WHERE email = ? AND role = ?',
      [email, role]
    )
    const user = Array.isArray(userRows) && userRows.length > 0 ? userRows[0] : null

    if (!user) {
      return {
        success: true, // Don't reveal if user exists
        message: "If an account exists with this email, you will receive a reset link."
      }
    }

    const token = uuidv4()
    const tokenId = uuidv4()
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour

    await db.execute(`
      INSERT INTO password_reset_tokens (id, userId, token, expiresAt, role)
      VALUES (?, ?, ?, ?, ?)
    `, [tokenId, (user as any).id, token, expiresAt, role])

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&userId=${(user as any).id}&role=${role}`
    await sendPasswordResetEmail(email, resetUrl, role)

    return {
      success: true,
      message: "Reset link sent successfully"
    }
  } catch (error) {
    console.error("Password reset request error:", error)
    return {
      success: false,
      message: "Failed to process reset request"
    }
  }
}

// Reset password using the token
export async function resetPassword(token: string, userId: string, newPassword: string) {
  try {
    const db = await getDb()

    const [tokenRows] = await db.execute(`
      SELECT userId, role 
      FROM password_reset_tokens 
      WHERE token = ? 
      AND userId = ? 
      AND expiresAt > NOW()
    `, [token, userId])

    if (!Array.isArray(tokenRows) || tokenRows.length === 0) {
      return {
        success: false,
        message: "Invalid or expired reset token"
      }
    }

    const resetRequest = tokenRows[0] as any
    const hashedPassword = await bcryptjs.hash(newPassword, 12)

    // All users are now in the users table
    await db.execute(
      'UPDATE users SET password = ?, passwordUpdatedAt = NOW(), updatedAt = NOW() WHERE id = ?',
      [hashedPassword, userId]
    )

    await db.execute(
      'DELETE FROM password_reset_tokens WHERE token = ?',
      [token]
    )

    return {
      success: true,
      message: "Password reset successful"
    }
  } catch (error) {
    console.error("Error resetting password:", error)
    return {
      success: false,
      message: "Failed to reset password"
    }
  }
}
