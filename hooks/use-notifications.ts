import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string
  relatedId?: string
  isRead: boolean
  readAt?: Date
  createdAt: Date
  updatedAt: Date
}

export function useNotifications(apiUrl = '/api/notifications') {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(apiUrl, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [apiUrl])
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId }),
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, readAt: new Date() }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [apiUrl])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },        body: JSON.stringify({ notificationId }),
        credentials: 'include'
      })

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }, [notifications, apiUrl])

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }, [notifications, markAsRead])

  useEffect(() => {
    fetchNotifications()
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead
  }
}
