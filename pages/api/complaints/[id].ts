import { NextApiRequest, NextApiResponse } from "next"
import { getDb } from "@/lib/db"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const db = await getDb()
    const { id } = req.query

    const [rows] = await db.execute(`
      SELECT 
        c.*,
        u.department AS userDepartment,
        u.faculty AS userFaculty,
        u.level AS userLevel,
        DATE_FORMAT(c.examDate, '%Y-%m-%d') as examDate,
        DATE_FORMAT(c.createdAt, '%Y-%m-%d %H:%i:%s') as createdAt
      FROM complaints c
      INNER JOIN users u ON c.userId = u.id
      WHERE c.id = ?
    `, [id])

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" })
    }

    const complaint = rows[0] as any
    return res.status(200).json({
      ...complaint,
      department: complaint.userDepartment,
      faculty: complaint.userFaculty,
      level: complaint.userLevel
    })
  } catch (error) {
    console.error("Error fetching complaint:", error)
    return res.status(500).json({ message: "Failed to fetch complaint" })
  }
}