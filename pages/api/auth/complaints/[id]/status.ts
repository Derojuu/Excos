import type { NextApiRequest, NextApiResponse } from "next"
import { getDb } from "@/lib/db"
import { createNotification } from "@/lib/notifications"
import { verifyAdminAuth } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const connection = await (await getDb()).getConnection()

  try {
    // Verify admin authentication
    const userId = verifyAdminAuth(req)
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { id } = req.query
    const { status, notes } = req.body

    // Start transaction
    await connection.beginTransaction()

    try {      // Get current status
      const [currentStatusRows] = await connection.execute(
        "SELECT status FROM complaints WHERE id = ?",
        [id]
      )
      const oldStatus = (currentStatusRows as any[])[0]?.status      // Get admin info from users table
      const [adminRows] = await connection.execute(
        "SELECT firstName, lastName FROM users WHERE id = ? AND role = 'admin'",
        [userId]
      )
      const admin = (adminRows as any[])[0]

      if (!admin) {
        await connection.rollback()
        return res.status(404).json({ message: "Admin user not found" })
      }

      // Update complaint status
      await connection.execute(
        "UPDATE complaints SET status = ?, updatedAt = NOW() WHERE id = ?",
        [status, id]
      )

      // Record in history
      await connection.execute(`
        INSERT INTO complaint_status_history (
          id, complaint_id, old_status, new_status, 
          changed_by, changed_by_name, notes
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?)      `, [
        id, 
        oldStatus, 
        status, 
        userId,
        `${admin.firstName} ${admin.lastName}`,
        notes
      ])

      await connection.commit()

      // Get complaint details for notification
      const [complaintRows] = await connection.execute(
        "SELECT userId, examName FROM complaints WHERE id = ?",
        [id]
      )
      const complaint = (complaintRows as any[])[0]

      // Create notification for student
      if (complaint) {
        try {
          await createNotification({
            title: 'Complaint Status Updated',
            message: `Your complaint about ${complaint.examName} status has been changed to "${status}".`,
            type: status === 'resolved' ? 'success' : 'info',
            userId: complaint.userId,
            relatedId: id as string
          })
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError)
          // Don't fail the status update if notification fails
        }
      }      // Get updated history
      const [historyRows] = await connection.execute(`
        SELECT 
          id,          old_status,
          new_status,
          changed_by_name,
          notes,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
        FROM complaint_status_history 
        WHERE complaint_id = ?
        ORDER BY created_at DESC
      `, [id])

      return res.status(200).json({
        success: true,
        status,
        history: historyRows
      })

    } catch (error) {
      await connection.rollback()
      throw error
    }
  } catch (error) {
    console.error("Error updating status:", error)
    return res.status(500).json({ message: "Failed to update status" })
  } finally {
    connection.release()
  }
}