import type { NextApiRequest, NextApiResponse } from "next"
import { getDb } from "@/lib/db"
import { getSessionFromRequest } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify admin authentication using helper function
    const session = getSessionFromRequest(req)
    
    if (!session || !session.userId || session.role !== 'admin') {
      return res.status(401).json({ message: 'Admin access required' })
    }

    const db = await getDb()

    if (req.method === "GET") {
      const [rows] = await db.execute(
        "SELECT id, email, firstName, lastName, role, phone, department, position, faculty, profilePicUrl, createdAt, updatedAt FROM users WHERE id = ? AND role = 'admin'",
        [session.userId]
      )

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ message: "Admin not found" })
      }

      // Return user data
      const user = rows[0] as any
      res.status(200).json({
        ...user,
        bio: null, // This field doesn't exist in DB
        adminLevel: "Standard" // This is a computed field
      })    } else if (req.method === "PUT") {
      const { firstName, lastName, email, phone, department, position, faculty, profilePicUrl } = req.body

      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" })
      }

      // Update the fields in the database
      await db.execute(
        `UPDATE users SET 
         firstName = ?, 
         lastName = ?, 
         email = ?, 
         phone = ?,
         department = ?,
         position = ?,
         faculty = ?,
         profilePicUrl = ?,
         updatedAt = NOW() 
         WHERE id = ? AND role = 'admin'`,
        [firstName, lastName, email, phone, department, position, faculty, profilePicUrl, session.userId]
      )

      // Fetch and return the updated user data
      const [rows] = await db.execute(
        "SELECT id, email, firstName, lastName, role, phone, department, position, faculty, profilePicUrl, createdAt, updatedAt FROM users WHERE id = ? AND role = 'admin'",
        [session.userId]
      )

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ message: "Admin not found after update" })
      }

      // Return user data
      const user = rows[0] as any
      res.status(200).json({
        ...user,
        bio: null, // This field doesn't exist in DB
        adminLevel: "Standard" // This is a computed field
      })
    } else {
      return res.status(405).json({ message: "Method not allowed" })
    }
  } catch (error) {
    console.error('Admin profile API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}