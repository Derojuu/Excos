import { executeQuery } from './db'
import { v4 as uuidv4 } from 'uuid'

export interface NotificationData {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string
  relatedId?: string
}

export async function createNotification(data: NotificationData) {
  try {
    const id = uuidv4()

    await executeQuery(`
      INSERT INTO notifications (id, title, message, type, userId, relatedId, isRead, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())
    `, [id, data.title, data.message, data.type, data.userId, data.relatedId])

    return { id, ...data, isRead: false }
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

export async function createSystemNotification(
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info'
) {
  try {
    // Get all admin users
    const [adminRows] = await executeQuery(`
      SELECT id FROM users WHERE role = 'admin'
    `)

    const admins = adminRows as any[]

    // Create notifications for all admins
    const notifications = await Promise.all(
      admins.map(admin => 
        createNotification({
          title,
          message,
          type,
          userId: admin.id
        })
      )
    )

    return notifications
  } catch (error) {
    console.error('Error creating system notification:', error)
    throw error
  }
}

export async function getUserNotifications(userId: string, limit: number = 20) {
  try {
    // Ensure limit is a safe integer
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)))
    
    const [rows] = await executeQuery(`
      SELECT id, title, message, type, userId, relatedId, isRead, readAt, createdAt, updatedAt
      FROM notifications 
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT ${safeLimit}
    `, [userId])

    return rows as any[]
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
}

// Alias for getUserNotifications for compatibility
export async function getNotifications(userId: string, limit: number = 20) {
  return getUserNotifications(userId, limit)
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    await executeQuery(`
      UPDATE notifications 
      SET isRead = TRUE, readAt = NOW(), updatedAt = NOW()
      WHERE id = ? AND userId = ?
    `, [notificationId, userId])

    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

export async function deleteNotification(notificationId: string, userId: string) {
  try {
    await executeQuery(`
      DELETE FROM notifications 
      WHERE id = ? AND userId = ?
    `, [notificationId, userId])

    return { success: true }
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const [rows] = await executeQuery(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE userId = ? AND isRead = FALSE
    `, [userId])

    const result = rows as any[]
    return result[0]?.count || 0
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    throw error
  }
}

// Cleanup function to remove old notifications (older than 30 days)
export async function cleanupOldNotifications() {
  try {
    const [result] = await executeQuery(`
      DELETE FROM notifications
      WHERE createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND isRead = TRUE
    `)

    const deleteResult = result as any
    console.log(`Cleaned up ${deleteResult.affectedRows} old notifications`)
    return { count: deleteResult.affectedRows }
  } catch (error) {
    console.error('Error cleaning up notifications:', error)
    throw error
  }
}
