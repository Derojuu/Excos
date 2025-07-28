"use server"
import { z } from "zod"
import { getDb, generateId, generateReferenceNumber } from "@/lib/db"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// Define validation schema
const ComplaintSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  studentId: z.string().min(1, "Student ID is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  examName: z.string().min(1, "Exam name is required"),
  examDate: z.string().min(1, "Exam date is required"),
  complaintType: z.string().min(1, "Complaint type is required"),
  description: z.string().min(10, "Please provide a detailed description"),
  desiredResolution: z.string().min(5, "Please describe your desired resolution"),
  course: z.string().optional(),
  department: z.string().optional(),
  faculty: z.string().optional(),
  evidenceFile: z.string().optional(),
})

export type ComplaintFormState = {
  errors?: {
    fullName?: string[]
    studentId?: string[]
    email?: string[]
    phone?: string[]
    examName?: string[]
    examDate?: string[]
    complaintType?: string[]
    description?: string[]
    desiredResolution?: string[]
    course?: string[]
    department?: string[]
    faculty?: string[]
    evidenceFile?: string[]
  }
  message?: string | null
  referenceNumber?: string | null
  complaintId?: string | null
}

export async function submitComplaint(prevState: ComplaintFormState, formData: FormData): Promise<ComplaintFormState> {
  // Extract form data
  const validationData = {
    fullName: formData.get("fullName") as string,
    studentId: formData.get("studentId") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    examName: formData.get("examName") as string,
    examDate: formData.get("examDate") as string,
    complaintType: formData.get("complaintType") as string,
    description: formData.get("description") as string,
    desiredResolution: formData.get("resolution") as string,
    course: formData.get("course") as string,
    department: formData.get("department") as string,
    faculty: formData.get("faculty") as string,
    evidenceFile: "",
  }

  // Get evidence URL from Cloudinary upload (if provided)
  const evidenceUrl = formData.get("evidenceUrl") as string
  if (evidenceUrl) {
    validationData.evidenceFile = evidenceUrl
  }

  // Validate form data
  const validatedFields = ComplaintSchema.safeParse(validationData)

  // Return errors if validation fails
  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors)
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    }
  }

  // Generate a unique reference number
  const referenceNumber = generateReferenceNumber()
  const complaintId = generateId()

  try {
    const db = await getDb()

    // Check if user exists
    const [userRows] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [validationData.email]
    )

    let userId: string

    if (Array.isArray(userRows) && userRows.length > 0) {
      userId = (userRows[0] as any).id
    } else {
      // If user doesn't exist, create a temporary one
      userId = generateId()
      const hashedPassword = await bcrypt.hash("temporary-password", 10)
      
      await db.execute(`
        INSERT INTO users (id, email, firstName, lastName, studentId, password, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        validationData.email,
        validationData.fullName.split(" ")[0] || "",
        validationData.fullName.split(" ")[1] || "",
        validationData.studentId,
        hashedPassword,
        "student"
      ])
    }

    // Extract course, department, and faculty information from the exam name
    const course = validationData.course || validationData.examName
    const department = validationData.department || "General"
    const faculty = validationData.faculty || "General"

    const examDate = new Date(validationData.examDate)
    if (isNaN(examDate.getTime())) {
      return {
        message: "Invalid exam date. Please provide a valid date.",
      }
    }

    // Create the complaint
    await db.execute(`
      INSERT INTO complaints (
        id, referenceNumber, fullName, studentId, email, phone, examName, examDate,
        complaintType, description, desiredResolution, evidenceFile, course, department, faculty, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      complaintId,
      referenceNumber,
      validationData.fullName,
      validationData.studentId,
      validationData.email,
      validationData.phone || null,
      validationData.examName,
      examDate,
      validationData.complaintType,
      validationData.description,
      validationData.desiredResolution,
      validationData.evidenceFile || null,
      course,
      department,
      faculty,
      userId
    ])

    // Revalidate the complaints page
    revalidatePath("/track-complaint")
    revalidatePath("/admin/dashboard")

    // Return success state with reference number
    return {
      message: "Complaint submitted successfully!",
      referenceNumber,
      complaintId,
    }
  } catch (error) {
    console.error("Error submitting complaint:", {
      message: error instanceof Error ? error.message : "An unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined,
      validationData,
    })
    return {
      message: "An error occurred while submitting your complaint. Please try again later.",
    }
  }
}
