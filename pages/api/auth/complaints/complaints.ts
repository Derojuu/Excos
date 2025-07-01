import { generateId, generateReferenceNumber, executeQuery } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
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
          // For now, admins can see all complaints since we don't have department filtering in the current schema
          console.log('Admin fetching all complaints')
            // Fetch all complaints for admin - use string interpolation for LIMIT/OFFSET to avoid parameter issues
          const [rows] = await executeQuery(`
            SELECT 
              c.id,
              c.referenceNumber,
              c.fullName AS student,
              c.examName,
              DATE_FORMAT(c.examDate, '%Y-%m-%d') as examDate,
              DATE_FORMAT(c.createdAt, '%Y-%m-%d %H:%i:%s') as createdAt,
              c.complaintType AS type,
              c.status
            FROM complaints c 
            LEFT JOIN users u ON c.userId = u.id 
            ORDER BY c.createdAt DESC 
            LIMIT ${limit} OFFSET ${offset}
          `)

          // Return just the array for consistency with student response
          return res.status(200).json(rows)
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
    }

    // Handle POST request for creating complaints
    if (req.method === "POST") {
      console.log("POST request received. Processing complaint...");

      const uploadsDir = ensureUploadsDir();

      const form = new IncomingForm({
        uploadDir: uploadsDir,
        keepExtensions: true,
      });

      form.on("fileBegin", (name, file) => {
        const allowedFileTypes = [".jpg", ".jpeg", ".png", ".pdf"];
        const ext = path.extname(file.originalFilename || "").toLowerCase();
        console.log("File extension:", ext);
        console.log(`Received file: ${file.originalFilename}, Type: ${ext}`);

        if (file && !allowedFileTypes.includes(ext)) {
          return res.status(400).json({ message: "Invalid file type." });
        }

        file.filepath = path.join(uploadsDir, file.originalFilename || "");
      });

      form.on("file", async (name, file) => {
        try {
          const newFilePath = path.join(uploadsDir, `${Date.now()}-${file.originalFilename}`);
          console.log("Renaming file:", file.filepath, "->", newFilePath);
          await fs.promises.rename(file.filepath, newFilePath);
          file.filepath = newFilePath;
        } catch (err) {
          console.error("Error renaming file:", err);
          res.status(500).json({ message: "Failed to rename file." });
        }
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);          return res.status(500).json({ message: "Error processing the form." });
        }

        console.log("Authenticated user:", session);        const validatedFields = {
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
          evidenceUrl: fields.evidenceUrl ? fields.evidenceUrl[0] : '',
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
          evidenceUrl,
        } = validationResult.data;

        // Use evidenceUrl from form data (uploaded to GCS) instead of file upload
        const evidenceFile = evidenceUrl || null;        try {
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
    }
  } catch (err) {
    console.error("Error decoding or parsing session cookie:", err);
    return res.status(400).json({ message: "Invalid session cookie format." });
  }
}

function ensureUploadsDir(): string {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Uploads directory created:", uploadsDir);  }
  return uploadsDir;
}
