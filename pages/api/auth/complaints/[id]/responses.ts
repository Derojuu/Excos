import { NextApiRequest, NextApiResponse } from "next"
import { getDb } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import { sendResponseNotification } from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import { verifyAdminAuth } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Verify admin authentication
    const userId = verifyAdminAuth(req)
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }    const db = await getDb()
    const complaintId = req.query.id as string
    const { text } = req.body

    const [complaintRows] = await db.execute(`
      SELECT c.*, u.email, c.examName, c.userId
      FROM complaints c
      INNER JOIN users u ON c.userId = u.id
      WHERE c.id = ?
    `, [complaintId])

    if (!Array.isArray(complaintRows) || complaintRows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" })
    }

    const complaint = complaintRows[0] as any

    const [adminRows] = await db.execute(`
      SELECT id, firstName, lastName 
      FROM users 
      WHERE id = ? AND role = 'admin'
    `, [userId])

    if (!Array.isArray(adminRows) || adminRows.length === 0) {
      return res.status(401).json({ message: "Unauthorized - Admin not found" })
    }

    const admin = adminRows[0] as any
    const responseId = uuidv4()
    const adminFullName = `${admin.firstName} ${admin.lastName}`

    await db.execute(`
      INSERT INTO responses (
        id, text, author, authorId, complaintId, createdAt
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `, [responseId, text, adminFullName, admin.id, complaintId])

    // Create notification for student
    try {
      await createNotification({
        title: 'New Response to Your Complaint',
        message: `An administrator has responded to your complaint about ${complaint.examName}.`,
        type: 'info',
        userId: complaint.userId,
        relatedId: complaintId
      })
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the response if notification fails
    }

    await sendResponseNotification(
      complaint.email,
      {
        examName: complaint.examName,
        responseText: text,
        adminName: adminFullName,
        complaintId: complaintId
      }
    )

    const [newResponseRows] = await db.execute<any[]>(`
      SELECT 
        r.id,
        r.text,
        r.author,
        DATE_FORMAT(r.createdAt, '%b %d, %Y %H:%i') as date
      FROM responses r
      WHERE r.id = ?
    `, [responseId])

    const newResponse = newResponseRows[0]
    return res.status(200).json(newResponse)

  } catch (error) {
    console.error("Error adding response:", error)
    return res.status(500).json({ 
      message: "Failed to add response",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}