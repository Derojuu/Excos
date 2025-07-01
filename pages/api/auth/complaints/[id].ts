import { getDb } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie"

// Helper function to build role-based WHERE clause for admin filtering
function buildAdminFilterQuery(position: string, department?: string, faculty?: string, courses?: string) {
  switch (position) {
    case 'lecturer':
      // Lecturers see complaints related to their courses
      if (courses) {
        const courseList = courses.split(',').map(course => course.trim()).filter(course => course)
        if (courseList.length > 0) {
          const placeholders = courseList.map(() => '?').join(',')
          return {
            whereClause: `AND (c.course IN (${placeholders}) OR c.course IS NULL)`,
            params: courseList
          }
        }
      }
      return { whereClause: 'AND c.course IS NULL', params: [] }
    
    case 'hod':
      // HODs see complaints related to their department
      if (department) {
        return {
          whereClause: 'AND (c.department = ? OR c.department IS NULL)',
          params: [department]
        }
      }
      return { whereClause: 'AND c.department IS NULL', params: [] }
    
    case 'dean':
      // Deans see complaints related to their faculty
      if (faculty) {
        return {
          whereClause: 'AND (c.faculty = ? OR c.faculty IS NULL)',
          params: [faculty]
        }
      }
      return { whereClause: 'AND c.faculty IS NULL', params: [] }
    
    case 'admin':
    case 'system-administrator':
      // System administrators see all complaints
      return { whereClause: '', params: [] }
    
    default:
      // Default: no complaints visible
      return { whereClause: 'AND 1=0', params: [] }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Check authentication
    const cookies = parse(req.headers.cookie || "")
    const sessionCookie = cookies.session

    if (!sessionCookie) {
      return res.status(401).json({ message: "Not authenticated" })
    }

    const session = JSON.parse(decodeURIComponent(sessionCookie))
    
    if (!session?.userId || !session?.role) {
      return res.status(401).json({ message: "Invalid session" })
    }

    const { userId, role } = session
    const db = await getDb()
    const { id } = req.query

    // Role-based access control
    if (role === "admin") {
      // Get admin details to determine access permissions      // For now, admin can see all complaints since we don't have department filtering
      console.log('Admin accessing complaint:', id)
        const query = `
        SELECT 
          c.*,
          u.firstName,
          u.lastName,
          u.email,
          u.phone,
          u.level,
          u.department as userDepartment,
          u.faculty as userFaculty,
          u.courses as userCourses,
          DATE_FORMAT(c.examDate, '%Y-%m-%d') as examDate,
          DATE_FORMAT(c.createdAt, '%Y-%m-%d %H:%i:%s') as createdAt
        FROM complaints c
        INNER JOIN users u ON c.userId = u.id
        WHERE c.id = ?
      `
      
      const [rows] = await db.execute(query, [id])

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ message: "Complaint not found or access denied" })
      }      const complaint = rows[0] as any

      // Get responses
      const [responseRows] = await db.execute(`
        SELECT 
          id,
          text,
          author,
          DATE_FORMAT(createdAt, '%b %d, %Y %H:%i') as date
        FROM responses 
        WHERE complaintId = ? 
        ORDER BY createdAt DESC
      `, [id])

      // Get status history for admins
      const [historyRows] = await db.execute(`
        SELECT 
          id,
          old_status,
          new_status,
          changed_by_name,
          notes,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
        FROM complaint_status_history 
        WHERE complaint_id = ?
        ORDER BY created_at DESC
      `, [id])

      complaint.responses = responseRows
      complaint.statusHistory = historyRows
      return res.status(200).json(complaint)
      
    } else {
      // Students can only see their own complaints
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
        WHERE c.id = ? AND c.userId = ?
      `, [id, userId])

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ message: "Complaint not found" })
      }

      const complaint = rows[0] as any

      // Get responses
      const [responseRows] = await db.execute(`
        SELECT 
          id,
          text,
          author,
          DATE_FORMAT(createdAt, '%b %d, %Y %H:%i') as date
        FROM responses 
        WHERE complaintId = ? 
        ORDER BY createdAt DESC
      `, [id])

      complaint.responses = responseRows
      return res.status(200).json(complaint)
    }
  } catch (error) {
    console.error("Error fetching complaint:", error)
    return res.status(500).json({ message: "Failed to fetch complaint" })
  }
}