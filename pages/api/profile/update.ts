// pages/api/profile/update.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { getDb } from "@/lib/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" })

  try {
    const {
      id,
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      profilePicUrl
    } = req.body

    const db = await getDb()

    await db.execute(`
      UPDATE users
      SET firstName=?, lastName=?, email=?, phone=?,
          department=?, position=?, profilePicUrl=?, updatedAt=NOW()
      WHERE id=?
    `, [firstName, lastName, email, phone, department, position, profilePicUrl, id])

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Update error:", error)
    res.status(500).json({ success: false, message: "Error updating profile" })
  }
}
