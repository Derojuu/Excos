"use server"

import { getDb, generateId } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { serialize } from "cookie"
import bcryptjs from "bcryptjs"

// Register a new admin user
export async function registerAdmin(data: {
  firstName: string
  lastName: string
  email: string
  staffId: string
  password: string
  position: string
  department?: string
  faculty?: string
  courses?: string
}) {
  try {
    const db = await getDb()

    // Check if admin already exists
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE email = ? AND role = 'admin'",
      [data.email]
    )

    if (Array.isArray(rows) && rows.length > 0) {
      return {
        success: false,
        message: "An admin with this email already exists.",
      }
    }

    const adminId = generateId()
    const hashedPassword = await hashPassword(data.password)

    await db.execute(`
      INSERT INTO users (
        id, email, password, firstName, lastName, staffId,
        position, department, faculty, courses, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      adminId,
      data.email,
      hashedPassword,
      data.firstName,
      data.lastName,
      data.staffId,
      data.position || null,
      data.department || null,
      data.faculty || null,
      data.courses || null,
      "admin"
    ])

    return {
      success: true,
      message: "Admin registered successfully",
    }
  } catch (error) {
    console.error("Error registering admin:", error)
    return {
      success: false,
      message: "Failed to register admin. Please try again later.",
    }
  }
}

// Hash password function
export async function hashPassword(password: string) {
  return bcryptjs.hash(password, 10)
}

// Register a new student user
export async function registerStudent(data: {
  firstName: string
  lastName: string
  email: string
  password: string
  studentId: string
  department: string
  faculty: string
  level: string
  role: string
}) {
  try {
    const db = await getDb()
    const hashedPassword = await bcryptjs.hash(data.password, 10)
    console.log("Hashed password during registration:", hashedPassword)

    // Check if email or studentId already exists
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE email = ? OR studentId = ?",
      [data.email, data.studentId]
    )

    if (Array.isArray(rows) && rows.length > 0) {
      return { 
        success: false, 
        message: "Email or Student ID already registered" 
      }
    }

    const userId = generateId()

    await db.execute(`
      INSERT INTO users (
        id, email, password, firstName, lastName, 
        studentId, department, faculty, level, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      data.email,
      hashedPassword,
      data.firstName,
      data.lastName,
      data.studentId,
      data.department,
      data.faculty,
      data.level,
      "student"
    ])

    return {
      success: true,
      message: "Registration successful"
    }

  } catch (error) {
    console.error("Database error during registration:", error)
    return {
      success: false,
      message: "Registration failed"
    }
  }
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcryptjs.compare(password, hashedPassword)
}

export async function loginUser(email: string, password: string, role: string) {
  try {
    const db = await getDb()
    
    const query = role === 'admin' 
      ? "SELECT * FROM users WHERE email = ? AND role = 'admin'"
      : "SELECT * FROM users WHERE email = ? AND role = 'student'"

    const params = [email]
    const [rows] = await db.execute(query, params)

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, message: "Invalid email or password." }
    }

    const user = rows[0] as any

    const isValid = await bcryptjs.compare(password, user.password)
    
    console.log('Password comparison:', {
      inputPassword: password,
      hashedPassword: user.password,
      isValid
    })

    if (!isValid) {
      return { success: false, message: "Invalid email or password." }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role // Use the role from the database, not the request
      }
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Login failed" }
  }
}

// Login function
export async function login(data: { email: string; password: string; role: string }, res: any) {
  try {
    const db = await getDb()

    const query = data.role === 'admin' 
      ? "SELECT * FROM users WHERE email = ? AND role = 'admin'"
      : "SELECT * FROM users WHERE email = ? AND role = 'student'"

    const [rows] = await db.execute(query, [data.email])

    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        success: false,
        message: "Invalid email or password.",
      }
    }

    const user = rows[0] as any

    const isPasswordValid = await bcryptjs.compare(data.password, user.password)

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      }
    }

    // Create a session
    const sessionId = generateId()
    const session = {
      id: sessionId,
      userId: user.id,
      role: data.role,
      position: user.position || null,
      department: user.department || null,
      faculty: user.faculty || null,
      courses: user.courses || null,
    }

    // Set the session cookie
    const cookie = serialize("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    res.setHeader("Set-Cookie", cookie)

    return {
      success: true,
      role: data.role,
      position: user.position || null,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "Login failed",
    }
  }
}

// Logout function
export async function logout() {
  try {
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)
    const db = await getDb()

    // All users are in the users table, but verify role matches session
    const table = "users"
    const columns = "id, email, firstName, lastName, studentId, staffId, phone, position, department, faculty, courses, profilePicUrl, role"

    console.log(`Querying table: ${table} for userId: ${session.userId}`)

    const [rows] = await db.execute(
      `SELECT ${columns} FROM ${table} WHERE id = ? AND role = ?`,
      [session.userId, session.role]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return null
    }

    const user = rows[0] as any

    return {
      ...user,
      role: session.role,
      password: undefined, // Don't return the password
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
