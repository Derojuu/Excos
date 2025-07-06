import { generateId, generateReferenceNumber, executeQuery } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ComplaintSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  studentId: z.string().min(1, "Student ID is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  examName: z.string().min(1, "Exam name is required"),
  examDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid exam date"),
  complaintType: z.string().min(1, "Complaint type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  desiredResolution: z.string().min(5, "Desired resolution must be at least 5 characters"),
  course: z.string().optional(),
  department: z.string().optional(),
  faculty: z.string().optional(),
  evidenceUrl: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Request received:", req.method);

  try {
    // Use the new session helper function
    const session = getSessionFromRequest(req)
    
    if (!session || !session.userId || !session.role) {
      console.log("No session cookie found")
      return res.status(401).json({ message: "Not authenticated" })
    }

    console.log("Session data:", { userId: session.userId, role: session.role })
    
    const { userId, role } = session

    if (req.method === "GET") {      try {
        const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
        const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

        console.log(`Fetching complaints as ${role} with limit:`, limit, "offset:", offset);        if (role === "admin") {
          // Get admin details to determine what complaints they can view
          const [adminRows] = await executeQuery(`
            SELECT position, department, faculty FROM users WHERE id = ? AND role = 'admin'
          `, [userId]);

          if (!Array.isArray(adminRows) || adminRows.length === 0) {
            return res.status(401).json({ message: "Admin not found" });
          }

          const admin = adminRows[0] as any;
          const { position, department, faculty } = admin;

          let whereClause = '';
          let params: any[] = [];

          // Apply role-based filtering
          switch (position) {
            case 'lecturer':
              // Lecturers view complaints within their department
              if (department) {
                whereClause = 'WHERE c.department = ?';
                params = [department];
              } else {
                whereClause = 'WHERE 1=0'; // No complaints if no department
              }
              break;

            case 'hod':
              // HODs view complaints within their department
              if (department) {
                whereClause = 'WHERE c.department = ?';
                params = [department];
              } else {
                whereClause = 'WHERE 1=0'; // No complaints if no department
              }
              break;

            case 'dean':
              // Deans view complaints within their faculty
              if (faculty) {
                whereClause = 'WHERE c.faculty = ?';
                params = [faculty];
              } else {
                whereClause = 'WHERE 1=0'; // No complaints if no faculty
              }
              break;

            case 'system-administrator':
            case 'admin':
              // System administrators view all complaints
              whereClause = '';
              params = [];
              break;

            default:
              // Unknown position - no access
              whereClause = 'WHERE 1=0';
              params = [];
          }

          console.log(`Admin position: ${position}, whereClause: ${whereClause}, params:`, params);

          const query = `
            SELECT 
              c.id,
              c.referenceNumber,
              c.fullName AS student,
              c.examName,
              DATE_FORMAT(c.examDate, '%Y-%m-%d') as examDate,
              DATE_FORMAT(c.createdAt, '%Y-%m-%d %H:%i:%s') as createdAt,
              c.complaintType AS type,
              c.status,
              c.department,
              c.faculty
            FROM complaints c 
            ${whereClause}
            ORDER BY c.createdAt DESC 
            LIMIT ${limit} OFFSET ${offset}
          `;

          const [rows] = await executeQuery(query, params);
          return res.status(200).json(rows);
        } else {
          // Student query remains unchanged
          const query = `            SELECT 
              id,
              referenceNumber,
              fullName AS student,
              examName,              DATE_FORMAT(examDate, '%Y-%m-%d') as examDate,
              DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt,
              complaintType AS type,
              status
            FROM complaints
            WHERE userId = ?
            ORDER BY createdAt DESC
            LIMIT ${limit} OFFSET ${offset}
          `
          const queryParams = [session.userId]
          const [rows] = await executeQuery(query, queryParams);

          return res.status(200).json(rows);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
        return res.status(500).json({ message: "Failed to fetch complaints" });
      }
    }    // Handle POST request for creating complaints
    if (req.method === "POST") {
      console.log("POST request received. Processing complaint...");

      // Since file upload is disabled, handle as JSON request
      const form = new IncomingForm({
        maxFileSize: 0, // Disable file uploads
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          return res.status(500).json({ message: "Error processing the form." });
        }

        console.log("Authenticated user:", session);

        const validatedFields = {
          fullName: fields.fullName ? fields.fullName[0] : '',
          studentId: fields.studentId ? fields.studentId[0] : '',
          email: fields.email ? fields.email[0] : '',
          phone: fields.phone ? fields.phone[0] : '',
          examName: fields.examName ? fields.examName[0] : '',
          examDate: fields.examDate ? fields.examDate[0] : '',
          complaintType: fields.complaintType ? fields.complaintType[0] : '',
          description: fields.description ? fields.description[0] : '',
          desiredResolution: fields.desiredResolution ? fields.desiredResolution[0] : '',
          course: fields.course ? fields.course[0] : '',
          department: fields.department ? fields.department[0] : '',
          faculty: fields.faculty ? fields.faculty[0] : '',
          evidenceUrl: '', // No file upload for now
        };

        const validationResult = ComplaintSchema.safeParse(validatedFields);
        if (!validationResult.success) {
          console.error("Validation failed:", validationResult.error.flatten());
          return res.status(400).json({ message: "Validation failed", errors: validationResult.error.flatten() });
        }        const {
          fullName,
          studentId,
          email: formEmail,
          phone,
          examName,
          examDate,
          complaintType,
          description,
          desiredResolution,
          course,
          department,
          faculty,
          evidenceUrl,        } = validationResult.data;

        // No file upload for now - evidence is disabled
        const evidenceFile = null;try {
          console.log("Database connected successfully.");

          const complaintId = generateId();
          const referenceNumber = generateReferenceNumber();

          // Convert examDate to MySQL date format
          const mysqlDate = new Date(examDate).toISOString().slice(0, 19).replace('T', ' ');          await executeQuery(`
            INSERT INTO complaints (
              id, referenceNumber, userId, fullName, studentId, email, phone, examName, examDate, complaintType, description, desiredResolution, evidenceFile, course, department, faculty
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            complaintId,
            referenceNumber,
            session.userId,
            fullName,
            studentId,
            formEmail,
            phone || null,
            examName,
            mysqlDate,
            complaintType,
            description,
            desiredResolution,
            evidenceFile,
            course || null,
            department || null,
            faculty || null
          ]);

          console.log("Complaint submitted successfully.");

          res.status(200).json({ message: "Complaint submitted successfully", referenceNumber });

        } catch (dbErr) {
          console.error("Database insertion error:", dbErr);
          res.status(500).json({ message: "Failed to submit the complaint to the database." });
        }
      });
    } else if (req.method !== "GET") {
      console.log("Invalid HTTP method:", req.method);
      return res.status(405).json({ message: "Method not allowed." });
    }  } catch (err) {
    console.error("Error decoding or parsing session cookie:", err);
    return res.status(400).json({ message: "Invalid session cookie format." });
  }
}
