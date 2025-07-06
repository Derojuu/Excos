import { getDb } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie"

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
    const { id } = req.query    // Role-based access control
    if (role === "admin") {
      // Get admin details to determine access permissions
      const [adminRows] = await db.execute(`
        SELECT position, department, faculty FROM users WHERE id = ? AND role = 'admin'
      `, [userId]);

      if (!Array.isArray(adminRows) || adminRows.length === 0) {
        return res.status(401).json({ message: "Admin not found" });
      }

      const admin = adminRows[0] as any;
      const { position, department, faculty } = admin;

      // Build access control query based on position
      let accessWhereClause = '';
      let accessParams: any[] = [id];

      switch (position) {
        case 'lecturer':
          if (department) {
            accessWhereClause = 'AND c.department = ?';
            accessParams.push(department);
          } else {
            return res.status(403).json({ message: "Access denied: No department assigned" });
          }
          break;

        case 'hod':
          if (department) {
            accessWhereClause = 'AND c.department = ?';
            accessParams.push(department);
          } else {
            return res.status(403).json({ message: "Access denied: No department assigned" });
          }
          break;

        case 'dean':
          if (faculty) {
            accessWhereClause = 'AND c.faculty = ?';
            accessParams.push(faculty);
          } else {
            return res.status(403).json({ message: "Access denied: No faculty assigned" });
          }
          break;

        case 'system-administrator':
        case 'admin':
          // System administrators can access all complaints
          accessWhereClause = '';
          break;

        default:
          return res.status(403).json({ message: "Access denied: Unknown position" });
      }

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
        WHERE c.id = ? ${accessWhereClause}
      `
        const [rows] = await db.execute(query, accessParams)

      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ message: "Complaint not found or access denied" });
      }const complaint = rows[0] as any

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