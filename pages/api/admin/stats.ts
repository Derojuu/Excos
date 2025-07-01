import { NextApiRequest, NextApiResponse } from 'next'
import { getDb } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify admin authentication using helper function
    const session = getSessionFromRequest(req)
    
    if (!session || !session.userId || session.role !== 'admin') {
      return res.status(401).json({ message: 'Admin access required' })
    }

    const db = await getDb()

    // Get current date for filtering
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Fetch total students
    const [studentRows] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "student"'
    )
    const totalStudents = (studentRows as any[])[0]?.count || 0

    // Fetch total complaints
    const [complaintRows] = await db.execute(
      'SELECT COUNT(*) as count FROM complaints'
    )
    const totalComplaints = (complaintRows as any[])[0]?.count || 0

    // Fetch pending complaints
    const [pendingRows] = await db.execute(
      'SELECT COUNT(*) as count FROM complaints WHERE status = "pending"'
    )
    const pendingReview = (pendingRows as any[])[0]?.count || 0

    // Fetch resolved this month
    const [resolvedRows] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM complaints 
      WHERE status = "resolved" 
      AND updatedAt >= ?
    `, [startOfMonth.toISOString().slice(0, 19).replace('T', ' ')])
    const resolvedThisMonth = (resolvedRows as any[])[0]?.count || 0    // Fetch active admins (those who exist in the system)
    const [adminRows] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
    )
    const activeAdmins = (adminRows as any[])[0]?.count || 0

    // Calculate average resolution time
    const [resolutionRows] = await db.execute(`
      SELECT 
        ROUND(AVG(TIMESTAMPDIFF(DAY, createdAt, updatedAt)), 1) as avgDays
      FROM complaints 
      WHERE status = "resolved"
    `)
    const avgDays = (resolutionRows as any[])[0]?.avgDays || 0
    const avgResolutionTime = avgDays > 0 ? `${avgDays} days` : 'N/A'

    // Get recent activity (today)
    const [activityRows] = await db.execute(`
      SELECT COUNT(*) as count
      FROM complaints
      WHERE DATE(createdAt) = CURDATE() OR DATE(updatedAt) = CURDATE()
    `)
    const recentActivity = (activityRows as any[])[0]?.count || 0

    // Get admin's last login (mock data since we don't track this yet)
    const lastLogin = 'Just now' // You can implement proper last login tracking

    // System uptime (mock - in real app this would come from monitoring)
    const systemUptime = '99.8%'

    const stats = {
      totalStudents,
      totalComplaints,
      pendingReview,
      resolvedThisMonth,
      avgResolutionTime,
      activeAdmins,
      systemUptime,
      lastLogin,
      recentActivity
    }

    res.status(200).json(stats)

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
