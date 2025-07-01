import { NextApiRequest, NextApiResponse } from "next"
import { hash, compare } from "bcryptjs"
import { getDb } from "@/lib/db"
import { getSessionFromRequest } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Password update request received")

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Use the new session helper
    const session = getSessionFromRequest(req)
    
    if (!session || !session.userId || !session.role) {
      console.log("Invalid session")
      return res.status(401).json({ message: "Not authenticated" })
    }

    console.log("Session user:", { userId: session.userId, role: session.role })

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      console.log("Missing password fields")
      return res.status(400).json({ message: "Missing required fields" })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" })
    }

    const db = await getDb()

    // All users are in the 'users' table now
    console.log(`Getting user ${session.userId} from users table`)

    const [rows] = await db.execute(`
      SELECT password 
      FROM users
      WHERE id = ?
    `, [session.userId])

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`User not found:`, session.userId)
      return res.status(404).json({ message: "User not found" })
    }

    const user = rows[0] as { password: string }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      console.log("Invalid current password")
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12)    // Update password
    await db.execute(`
      UPDATE users 
      SET password = ?, updatedAt = NOW()
      WHERE id = ?
    `, [hashedNewPassword, session.userId])

    console.log("Password updated successfully for user:", session.userId)
    res.status(200).json({ message: "Password updated successfully" })

  } catch (error) {
    console.error("Password update error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}