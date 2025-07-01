import { NextApiRequest, NextApiResponse } from "next"
import { getNotifications, markNotificationAsRead, deleteNotification } from "@/lib/notifications"
import { getSessionFromRequest } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = getSessionFromRequest(req)
    if (!session || !session.userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const userId = session.userId

    if (req.method === "GET") {
      const notifications = await getNotifications(userId)
      return res.status(200).json(notifications)
    }

    if (req.method === "PATCH") {
      const { notificationId } = req.body
      await markNotificationAsRead(notificationId, userId)
      return res.status(200).json({ message: "Notification marked as read" })
    }

    if (req.method === "DELETE") {
      const { notificationId } = req.body
      await deleteNotification(notificationId, userId)
      return res.status(200).json({ message: "Notification deleted" })
    }

    return res.status(405).json({ message: "Method not allowed" })

  } catch (error) {
    console.error("Error in notifications API:", error)
    return res.status(500).json({ 
      message: "Failed to handle notification request",
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
